# Third-party / design references

## React Bits

Website: https://reactbits.dev
Repository: https://github.com/DavidHDev/react-bits

React Bits is licensed under the MIT + Commons Clause terms published by its author. This APEX project does not depend on the React Bits website at runtime. The APEX interaction components in `app/components/AP_*` are local implementations influenced by the interaction patterns showcased by React Bits.

## Tailwind CSS

Website: https://tailwindcss.com
Tailwind CSS is used as the responsive utility layer for the public APEX layouts.

### React Bits components adapted in this build

- Split Flap Text — adapted locally into `app/components/AP_SplitFlapText.tsx`.
- Dot Field — adapted locally into `app/components/AP_DotField.tsx`.

Their interaction logic and visual treatment are customized for the APEX black/white/teal design system. No React Bits runtime package or external service is required.
