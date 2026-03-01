import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
