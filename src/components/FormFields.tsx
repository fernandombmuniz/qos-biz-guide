import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export const TextField = ({ label, value, onChange, placeholder }: TextFieldProps) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
    />
  </div>
);

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}

export const NumberField = ({ label, value, onChange, min = 0 }: NumberFieldProps) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    <Input
      type="number"
      value={value || ''}
      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      min={min}
      className="bg-secondary border-border text-foreground"
    />
  </div>
);

interface ToggleFieldProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

export const ToggleField = ({ label, value, onChange }: ToggleFieldProps) => (
  <div className="flex items-center justify-between py-2">
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    <Switch checked={value} onCheckedChange={onChange} />
  </div>
);

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const SelectField = ({ label, value, onChange, options, placeholder }: SelectFieldProps) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-secondary border-border text-foreground">
        <SelectValue placeholder={placeholder || 'Selecione'} />
      </SelectTrigger>
      <SelectContent className="bg-card border-border">
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}

export const TextAreaField = ({ label, value, onChange, placeholder, rows = 3 }: TextAreaFieldProps) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
    />
  </div>
);

interface TriStateFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onTextChange?: (v: string) => void;
  textValue?: string;
}

export const TriStateField = ({ label, value, onChange, onTextChange, textValue }: TriStateFieldProps) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    <div className="flex gap-2">
      {[
        { v: 'yes', l: 'Sim' },
        { v: 'no', l: 'Não' },
        { v: 'other', l: 'Outro' },
      ].map((opt) => (
        <button
          key={opt.v}
          type="button"
          onClick={() => onChange(opt.v)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            value === opt.v
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          {opt.l}
        </button>
      ))}
    </div>
    {value === 'other' && onTextChange && (
      <Input
        value={textValue || ''}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Especifique..."
        className="bg-secondary border-border text-foreground placeholder:text-muted-foreground mt-2"
      />
    )}
  </div>
);
