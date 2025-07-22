'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { trpc } from '~/utils/trpc';

interface PhantomPokemonProps {
  className?: string;
}

type Position = { x: number; y: number };

export default function PhantomPokemon({ className = '' }: PhantomPokemonProps) {
  /* --- Darkrai state --- */
  const [darkraiPos, setDarkraiPos] = useState<Position>({ x: 20, y: 50 });
  const [darkraiVisible, setDarkraiVisible] = useState(false);
  const [darkraiBlurred, setDarkraiBlurred] = useState(true);

  /* --- Giratina state --- */
  const [giratinaPos, setGiratinaPos] = useState<Position>({ x: 80, y: 60 });
  const [giratinaVisible, setGiratinaVisible] = useState(false);
  const [giratinaBlurred, setGiratinaBlurred] = useState(true);

  /* --- Data --- */
  const { data: artwork } = trpc.pokemon.officialArtworkByNames.useQuery({
    names: ['darkrai', 'giratina-origin'],
  });
  const [darkraiArt, giratinaArt] = artwork ?? [];

  /* --- Effect --- */
  useEffect(() => {
    if (!darkraiArt || !giratinaArt) return;

    // Initial appearance
    const darkraiInit = setTimeout(() => setDarkraiVisible(true), 1500);
    const giratinaInit = setTimeout(() => setGiratinaVisible(true), 1500);

    // Remove blur
    const darkraiUnblur = setTimeout(() => setDarkraiBlurred(false), 1500 + 800);
    const giratinaUnblur = setTimeout(() => setGiratinaBlurred(false), 1500 + 800);

    // Phantom cycles
    const createPhantom =
      (
        setPos: React.Dispatch<React.SetStateAction<Position>>,
        setBlur: React.Dispatch<React.SetStateAction<boolean>>,
        setVis: React.Dispatch<React.SetStateAction<boolean>>,
      ) =>
      () => {
        setBlur(true);
        setTimeout(() => setVis(false), 300);
        setTimeout(() => {
          setPos({ x: Math.random() * 80 + 10, y: Math.random() * 70 + 20 });
          setBlur(false);
          setVis(true);
        }, 300 + 500);
      };

    const darkraiCycle = createPhantom(setDarkraiPos, setDarkraiBlurred, setDarkraiVisible);
    const giratinaCycle = createPhantom(setGiratinaPos, setGiratinaBlurred, setGiratinaVisible);

    const darkraiFirstCycle = setTimeout(darkraiCycle, 4000);
    const giratinaFirstCycle = setTimeout(giratinaCycle, 5500);

    const darkraiLoop = setInterval(darkraiCycle, Math.random() * 3000 + 4000);
    const giratinaLoop = setInterval(giratinaCycle, Math.random() * 3000 + 5000);

    return () => {
      [
        darkraiInit,
        giratinaInit,
        darkraiUnblur,
        giratinaUnblur,
        darkraiFirstCycle,
        giratinaFirstCycle,
      ].forEach(clearTimeout);
      [darkraiLoop, giratinaLoop].forEach(clearInterval);
    };
  }, [darkraiArt, giratinaArt]);

  if (!darkraiArt || !giratinaArt) return null;

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      {[
        { art: darkraiArt, visible: darkraiVisible, blurred: darkraiBlurred, pos: darkraiPos },
        { art: giratinaArt, visible: giratinaVisible, blurred: giratinaBlurred, pos: giratinaPos },
      ].map(({ art, visible, blurred, pos }, i) => (
        <div
          key={i}
          className={`
              absolute size-24 md:size-32 lg:size-64 xl:size-96
              transition-all duration-500 ease-in-out
              ${visible ? 'opacity-70' : 'opacity-0'}
              ${blurred ? 'blur-sm' : 'blur-none'}
            `}
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: `translate(-50%, -50%) ${pos.x < 50 ? 'scaleX(-1)' : ''}`,
          }}
        >
          <Image
            src={art}
            alt={i === 0 ? 'Phantom Darkrai' : 'Phantom Giratina Origin'}
            fill
            className="object-contain opacity-80"
          />
        </div>
      ))}
    </div>
  );
}
