interface RoastEntry {
  it: string[];
  en: string[];
}

export const ROASTS: Record<string, RoastEntry> = {
  domination: {
    it: [
      'Hai dominato come un T20 in un finale di 170. Leggendario.',
      'Hai vinto così facilmente che la freccetta si annoiava già.',
      'Gli altri giocatori stanno ancora cercando i loro dardi.',
      'Hai reso questo match una formalità. Complimenti, campione.',
    ],
    en: [
      'You dominated like a T20 in a 170 finish. Legendary.',
      'You won so easily the dart was already bored.',
      'The other players are still looking for their darts.',
      'You made this match a formality. Well done, champion.',
    ],
  },
  sweat: {
    it: [
      'Vittoria sudata. Hai rischiato di perdere perfino contro te stesso.',
      'Bella partita, ma il cuore ha retto. Stavolta.',
      'Ci hai messo l\'anima. E pure i nervi. E pure il fegato.',
      'Vinci, ma il tuo medico vorrebbe una parola con te.',
    ],
    en: [
      'Sweaty win. You almost lost to yourself.',
      'Nice game, but the heart held. This time.',
      'You put your soul into it. And your nerves. And your liver.',
      'You win, but your doctor wants a word.',
    ],
  },
  comeback: {
    it: [
      'Rimonta epica. Hai trasformato un disastro in una leggenda.',
      'Eri già mentalmente sotto la doccia. Poi è successa la magia.',
      'Da zero a eroe in un solo turno. Cinema puro.',
      'Il pubblico immaginario è impazzito. Tu anche, probabilmente.',
    ],
    en: [
      'Epic comeback. You turned a disaster into a legend.',
      'You were already mentally in the shower. Then magic happened.',
      'From zero to hero in one turn. Pure cinema.',
      'The imaginary crowd went wild. You probably did too.',
    ],
  },
  disaster: {
    it: [
      'Hai perso, ma almeno hai tenuto la freccetta dritta... qualche volta.',
      'La prossima volta forse conviene giocare con gli occhi aperti.',
      'Il dartboard ti manda i suoi saluti e le sue condoglianze.',
      'Non disperare, c\'è sempre la boccette.',
    ],
    en: [
      'You lost, but at least you held the dart straight... sometimes.',
      'Next time maybe try playing with your eyes open.',
      'The dartboard sends its regards and condolences.',
      'Don\'t despair, there\'s always bocce.',
    ],
  },
  onehundred: {
    it: [
      'Centone! Non male per qualcuno che ha cenato pesante.',
      'T20 T20 T20. Finalmente stai facendo le cose per bene.',
      'Cento punti! Il divano può aspettare ancora un po\'.',
      '180? No. Ma ci stiamo avvicinando. Tipo.',
    ],
    en: [
      'Ton! Not bad for someone who had a heavy dinner.',
      'T20 T20 T20. You\'re finally doing things right.',
      'Hundred points! The couch can wait a bit longer.',
      '180? No. But we\'re getting closer. Kind of.',
    ],
  },
  bustking: {
    it: [
      'BUST! Il re del bust colpisce ancora. Iconico.',
      'Hai segnato più bust che punti. Risultato storico.',
      'La matematica dice che avresti dovuto stare sotto al limite. Tu no.',
      'Ogni bust è un\'opportunità di crescita. O almeno così ci diciamo.',
    ],
    en: [
      'BUST! The bust king strikes again. Iconic.',
      'You scored more busts than points. Historic achievement.',
      'Math says you should have stayed under the limit. You disagreed.',
      'Every bust is a growth opportunity. Or so we tell ourselves.',
    ],
  },
  closebuilt: {
    it: [
      'Bella partita. I dardi non mentono mai... quasi mai.',
      'Serata memorabile. Quasi quanto quella volta con la birra.',
      'Il garage ha visto di meglio. Ma anche di molto peggio.',
      'Freccette, birra e dignità. Due su tre non è male.',
    ],
    en: [
      'Good game. Darts never lie... almost never.',
      'Memorable evening. Almost as good as the beer night.',
      'The garage has seen better. But also much worse.',
      'Darts, beer and dignity. Two out of three isn\'t bad.',
    ],
  },
};

export function pickRoast(lang: string, key: string): string {
  const category = ROASTS[key] ?? ROASTS.closebuilt;
  const lines = (lang === 'en' ? category.en : category.it) ?? category.it;
  return lines[Math.floor(Math.random() * lines.length)];
}
