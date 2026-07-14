import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { StepPlayers } from './setup/StepPlayers';
import { StepFormat } from './setup/StepFormat';
import { StepReady } from './setup/StepReady';
import { Screen } from '../components/ui/Layout';
import { TopBar } from '../components/ui/Layout';
import { PrimaryBtn, GhostBtn } from '../components/ui/Buttons';
import { db } from '../lib/db';
import { useAppStore } from '../stores/app-store';
import { colorFromName } from '../lib/stats';
import type { PlayerProfile } from '../lib/types';

const STEPS = ['step1', 'step2', 'step3'] as const;

export default function Setup() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { startMatch, settings } = useAppStore();
  const [searchParams] = useSearchParams();
  const solo = searchParams.get('solo') === '1';

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [variant, setVariant] = useState<301 | 501 | 701>(501);
  const [setsToWin, setSetsToWin] = useState(1);
  const [legsToWin, setLegsToWin] = useState(3);
  const [doubleOut, setDoubleOut] = useState(true);
  const [inputMode, setInputMode] = useState<'total' | 'detailed'>(settings.inputMode);
  const [order, setOrder] = useState<string[]>([]);

  const players = useLiveQuery<PlayerProfile[]>(() => db.players.orderBy('createdAt').toArray(), []) ?? [];

  async function handleAddPlayer(name: string) {
    const id = crypto.randomUUID() as string;
    const color = colorFromName(name);
    const profile: PlayerProfile = {
      id,
      name,
      avatarColor: color,
      createdAt: Date.now(),
      stats: {
        matchesPlayed: 0,
        matchesWon: 0,
        legsWon: 0,
        legsPlayed: 0,
        avgThreeDart: 0,
        avgFirstNine: 0,
        bestLeg: null,
        bestCheckout: null,
        count100plus: 0,
        count140plus: 0,
        count180: 0,
        doublesHit: 0,
        doublesAttempted: 0,
      },
    };
    await db.players.add(profile);
    setSelected(prev => solo ? [id] : (prev.length < 4 ? [...prev, id] : prev));
  }

  function handleToggle(id: string) {
    if (solo) {
      setSelected(prev => (prev[0] === id ? [] : [id]));
      return;
    }
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }

  function handleShuffle() {
    setOrder(prev => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
  }

  function handleNext() {
    if (step === 0 && solo) {
      const player = players.find(p => p.id === selected[0]);
      if (!player) return;
      startMatch({
        variant: 501,
        setsToWin: 1,
        legsToWin: 3,
        doubleOut: true,
        inputMode: settings.inputMode,
        players: [{ id: player.id, name: player.name, color: player.avatarColor || colorFromName(player.name) }],
      });
      navigate('/game');
      return;
    }
    if (step === 0) {
      setOrder([...selected]);
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else {
      // Start match
      const selectedPlayers = order
        .map(id => players.find(p => p.id === id))
        .filter(Boolean) as PlayerProfile[];

      startMatch({
        variant,
        setsToWin,
        legsToWin,
        doubleOut,
        inputMode,
        players: selectedPlayers.map(p => ({
          id: p.id,
          name: p.name,
          color: p.avatarColor || colorFromName(p.name),
        })),
      });
      navigate('/game');
    }
  }

  function handleBack() {
    if (step === 0) navigate('/');
    else setStep(s => s - 1);
  }

  const canNext = step === 0 ? selected.length >= (solo ? 1 : 2) : true;

  return (
    <Screen style={{ padding: '16px 16px 100px' }}>
      <TopBar
        title={solo ? t('trainingStep') : t(STEPS[step])}
        left={
          <GhostBtn onClick={handleBack} style={{ padding: '4px 0' }}>
            <ChevronLeft size={20} /> {t('back')}
          </GhostBtn>
        }
      />

      {/* Step dots */}
      {!solo && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 20 : 8,
                height: 8,
                borderRadius: 4,
                background: i === step ? 'rgb(var(--accent))' : i < step ? 'rgb(var(--accent-dim))' : 'rgb(var(--bg-input))',
                transition: 'all .2s',
              }}
            />
          ))}
        </div>
      )}

      {step === 0 && (
        <StepPlayers
          players={players}
          selected={selected}
          onToggle={handleToggle}
          onAddPlayer={handleAddPlayer}
        />
      )}
      {step === 1 && (
        <StepFormat
          variant={variant}
          setVariant={setVariant}
          setsToWin={setsToWin}
          setSetsToWin={setSetsToWin}
          legsToWin={legsToWin}
          setLegsToWin={setLegsToWin}
          doubleOut={doubleOut}
          setDoubleOut={setDoubleOut}
          inputMode={inputMode}
          setInputMode={setInputMode}
        />
      )}
      {step === 2 && (
        <StepReady
          variant={variant}
          setsToWin={setsToWin}
          legsToWin={legsToWin}
          doubleOut={doubleOut}
          inputMode={inputMode}
          players={players}
          order={order}
          onShuffle={handleShuffle}
        />
      )}

      {/* Next button */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          background: 'rgb(var(--bg-base))',
          borderTop: '1px solid rgb(var(--border-default))',
        }}
      >
        <PrimaryBtn full onClick={handleNext} disabled={!canNext}>
          {solo ? t('startTraining') : step === 2 ? t('start') : t('next')}
        </PrimaryBtn>
      </div>
    </Screen>
  );
}
