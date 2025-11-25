/**
 * PasswordStrengthBar Component
 * Shows password strength with visual indicator
 */

interface PasswordStrengthBarProps {
  password: string;
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const calculateStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    return Math.min(strength, 4);
  };

  const strength = calculateStrength(password);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-2 flex-1 rounded-full transition-colors ${
              level <= strength ? colors[strength] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-sm font-medium text-gray-700">
        Password strength: {labels[strength]}
      </p>
    </div>
  );
}
