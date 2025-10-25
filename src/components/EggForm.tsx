import { useState, FormEvent } from 'react';
import { Egg, DonenessLevel, TemperatureLevel } from '../types';

interface EggFormProps {
  onAddEgg: (egg: Egg) => void;
  disabled: boolean;
}

export function EggForm({ onAddEgg, disabled }: EggFormProps) {
  const [weight, setWeight] = useState<string>('50');
  const [doneness, setDoneness] = useState<DonenessLevel>('medium');
  const [temperature, setTemperature] =
    useState<TemperatureLevel>('refrigerated');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const weightNum = parseFloat(weight);

    // Validation
    if (isNaN(weightNum)) {
      setError('Please enter a valid weight');
      return;
    }

    if (weightNum < 20 || weightNum > 100) {
      setError('Weight must be between 20 and 100 grams');
      return;
    }

    // Create new egg with unique ID
    const newEgg: Egg = {
      id: crypto.randomUUID(),
      weight: weightNum,
      doneness,
      temperature,
    };

    onAddEgg(newEgg);

    // Reset form to defaults
    setWeight('50');
    setDoneness('medium');
    setTemperature('refrigerated');
  };

  return (
    <div className="egg-form">
      <h2>Add New Egg</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="weight">
            Weight (grams):
            <input
              type="number"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="20"
              max="100"
              step="1"
              disabled={disabled}
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="doneness">
            Doneness:
            <select
              id="doneness"
              value={doneness}
              onChange={(e) => setDoneness(e.target.value as DonenessLevel)}
              disabled={disabled}
            >
              <option value="soft">Soft</option>
              <option value="medium">Medium</option>
              <option value="harder">Harder</option>
              <option value="hard">Hard</option>
            </select>
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="temperature">
            Temperature:
            <select
              id="temperature"
              value={temperature}
              onChange={(e) =>
                setTemperature(e.target.value as TemperatureLevel)
              }
              disabled={disabled}
            >
              <option value="refrigerated">Refrigerated (~6°C)</option>
              <option value="room">Room temperature (~20°C)</option>
            </select>
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={disabled} className="add-button">
          Add Egg
        </button>

        {disabled && (
          <p className="form-disabled-message">
            Cannot add eggs while timer is running
          </p>
        )}
      </form>
    </div>
  );
}
