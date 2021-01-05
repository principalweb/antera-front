import { RouterEffects } from './router.effect';
import { ConfigEffects } from './config.effects';

export const effects: any[] = [RouterEffects, ConfigEffects];

export * from './router.effect';
export * from './config.effects';
