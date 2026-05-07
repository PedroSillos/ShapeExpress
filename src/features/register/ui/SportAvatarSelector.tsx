import React from 'react';
import { SPORT_AVATARS, generateAvatarUrl } from '../../../shared/lib/sportAvatars';
import { cn } from '../../../utils/cn';

interface SportAvatarSelectorProps {
  currentAvatarUrl: string;
  onSelect: (avatarUrl: string) => void;
}

export function SportAvatarSelector({ currentAvatarUrl, onSelect }: SportAvatarSelectorProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60 text-center">Escolha seu avatar esportivo</p>
      <div className="grid grid-cols-5 gap-3">
        {SPORT_AVATARS.map((avatar) => {
          const avatarUrl = generateAvatarUrl(avatar);
          const isSelected = currentAvatarUrl === avatarUrl;
          
          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => onSelect(avatarUrl)}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden transition-all",
                "hover:scale-105 active:scale-95",
                isSelected 
                  ? "ring-4 ring-brand-red shadow-lg shadow-brand-red/30" 
                  : "ring-2 ring-white/10 hover:ring-white/30"
              )}
              title={avatar.name}
            >
              <img 
                src={avatarUrl} 
                alt={avatar.name}
                className="w-full h-full object-cover"
              />
              {isSelected && (
                <div className="absolute inset-0 bg-brand-red/20 flex items-center justify-center">
                  <div className="w-6 h-6 bg-brand-red rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
