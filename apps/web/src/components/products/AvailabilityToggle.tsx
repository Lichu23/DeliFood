  'use client';

  interface AvailabilityToggleProps {
    available: boolean;
    onChange: () => void;
  }

  export function AvailabilityToggle({
    available,
    onChange,
  }: AvailabilityToggleProps) {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      e.nativeEvent.stopImmediatePropagation();
      onChange();
    };

    return (
      <button
        type="button"
        onClick={handleClick}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          available ? 'bg-green-500' : 'bg-gray-300'
        }`}
        role="switch"
        aria-checked={available}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            available ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
        <span className="sr-only">
          {available ? 'Disponible' : 'No disponible'}
        </span>
      </button>
    );
  }