interface ColorSwatchesProps {
  colors: string[];
  selected: string;
  onSelect: (color: string) => void;
}

const colorMap: Record<string, string> = {
  'White': '#ffffff', 'Optic White': '#f5f5f5', 'Black': '#1a1a1a', 'Carbon Black': '#0d0d0d',
  'Navy': '#1e3a5f', 'Navy Blue': '#1e3a5f', 'Gray': '#b0b0b0', 'Heather Grey': '#b0b0b0',
  'Olive': '#7a8a6e', 'Olive Sage': '#7a8a6e', 'Burgundy': '#6e2c2c', 'Bone': '#e8dcc8',
  'Washed Brown': '#8b7355', 'Sand Beige': '#d4c5a9', 'Forest Green': '#2d5a27',
  'Mustard': '#e3b34a', 'Army Green': '#4a5d23',
};

export default function ColorSwatches({ colors, selected, onSelect }: ColorSwatchesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map(color => {
        const bgColor = colorMap[color] || color;
        return (
          <button
            key={color}
            onClick={() => onSelect(color)}
            className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${
              selected === color ? 'border-mz-black scale-110' : 'border-mz-gray-200 hover:border-mz-gray-400'
            }`}
            style={{ backgroundColor: bgColor }}
            title={color}
          />
        );
      })}
    </div>
  );
}
