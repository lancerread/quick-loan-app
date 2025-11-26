import { useState } from 'react';
import { useLocation } from 'wouter';
import { useLoanContext } from '@/context/LoanContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

const EligibilityPage = () => {
  const [, setLocation] = useLocation();
  const { setFormData } = useLoanContext();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    idNumber: '',
    loanType: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!form.idNumber.trim()) {
      newErrors.idNumber = 'ID number is required';
    }

    if (!form.loanType) {
      newErrors.loanType = 'Please select a loan type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setFormData(form);
      setLocation('/apply');
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="mb-6"
          data-testid="button-back-home"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="p-6 sm:p-8 shadow-elevated">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2" data-testid="text-eligibility-title">
              Check Your Eligibility
            </h1>
            <p className="text-muted-foreground">
              Fill in your details to see if you qualify for a loan
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-destructive' : ''}
                data-testid="input-name"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1" data-testid="error-name">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0712345678"
                value={form.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'border-destructive' : ''}
                data-testid="input-phone"
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1" data-testid="error-phone">{errors.phone}</p>
              )}
            </div>

            <div>
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                id="idNumber"
                type="text"
                placeholder="Enter your ID number"
                value={form.idNumber}
                onChange={(e) => handleInputChange('idNumber', e.target.value)}
                className={errors.idNumber ? 'border-destructive' : ''}
                data-testid="input-id-number"
              />
              {errors.idNumber && (
                <p className="text-sm text-destructive mt-1" data-testid="error-id-number">{errors.idNumber}</p>
              )}
            </div>

            <div>
              <Label htmlFor="loanType">Loan Type</Label>
              <Select
                value={form.loanType}
                onValueChange={(value) => handleInputChange('loanType', value)}
              >
                <SelectTrigger className={errors.loanType ? 'border-destructive' : ''} data-testid="select-loan-type">
                  <SelectValue placeholder="Select loan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal Loan</SelectItem>
                  <SelectItem value="business">Business Loan</SelectItem>
                  <SelectItem value="emergency">Emergency Loan</SelectItem>
                  <SelectItem value="education">Education Loan</SelectItem>
                </SelectContent>
              </Select>
              {errors.loanType && (
                <p className="text-sm text-destructive mt-1" data-testid="error-loan-type">{errors.loanType}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" data-testid="button-continue">
              Continue to Loan Selection
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EligibilityPage;
