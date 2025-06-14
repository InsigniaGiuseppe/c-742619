
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FormattedNumber from '@/components/FormattedNumber';

const FormattingTest = () => {
  const testValues = [
    { value: 1234.56, label: 'Standard Amount' },
    { value: 1234567.89, label: 'Large Amount (Millions)' },
    { value: 1234567890.12, label: 'Huge Amount (Billions)' },
    { value: 0.00123456, label: 'Small Crypto Price' },
    { value: 0.00000001, label: 'Micro Price' },
    { value: 12.34, label: 'Percentage' },
    { value: -5.67, label: 'Negative Percentage' },
    { value: 0, label: 'Zero Value' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Formatting Test Suite</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testValues.map((test, index) => (
          <Card key={index} className="glass">
            <CardHeader>
              <CardTitle className="text-lg">{test.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Currency (with tooltip)</p>
                <FormattedNumber value={test.value} type="currency" />
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Currency Compact</p>
                <FormattedNumber value={test.value} type="currency" compact={true} />
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                <FormattedNumber value={test.value} type="price" />
              </div>
              
              {test.value > 1000 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
                  <FormattedNumber value={test.value} type="marketCap" />
                </div>
              )}
              
              {test.label.includes('Percentage') && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Percentage</p>
                  <FormattedNumber value={test.value} type="percentage" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="mt-8 glass">
        <CardHeader>
          <CardTitle>Tooltip Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Hover over these numbers to see detailed tooltips:</p>
          <div className="space-y-2">
            <p>Large amount: <FormattedNumber value={1234567890} type="currency" /></p>
            <p>Market cap: <FormattedNumber value={987654321000} type="marketCap" /></p>
            <p>Small price: <FormattedNumber value={0.000123} type="price" /></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormattingTest;
