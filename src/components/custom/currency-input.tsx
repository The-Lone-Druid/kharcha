import * as React from "react";
import { Check, ChevronsUpDown, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  CURRENCIES,
  getExchangeRateLookupUrl,
  calculateConvertedAmount,
} from "@/lib/currency";

interface CurrencyInputProps {
  value: number | undefined;
  onChange: (value: number) => void;
  preferredCurrency: string;
  disabled?: boolean;
}

export function CurrencyInput({
  value,
  onChange,
  preferredCurrency,
  disabled,
}: CurrencyInputProps) {
  const actualValue = value ?? 0;
  const [showCurrencyConverter, setShowCurrencyConverter] =
    React.useState(false);
  const [selectedCurrency, setSelectedCurrency] = React.useState<string>("");
  const [foreignAmount, setForeignAmount] = React.useState<string>("");
  const [exchangeRate, setExchangeRate] = React.useState<string>("");
  const [open, setOpen] = React.useState(false);

  // Calculate converted amount when inputs change
  React.useEffect(() => {
    const amount = parseFloat(foreignAmount);
    const rate = parseFloat(exchangeRate);

    if (
      selectedCurrency &&
      !isNaN(amount) &&
      amount > 0 &&
      !isNaN(rate) &&
      rate > 0
    ) {
      const converted = calculateConvertedAmount(amount, rate);
      onChange(converted);
    }
  }, [foreignAmount, exchangeRate, selectedCurrency, onChange]);

  const handleCloseCurrencyConverter = () => {
    setShowCurrencyConverter(false);
    setSelectedCurrency("");
    setForeignAmount("");
    setExchangeRate("");
  };

  const selectedCurrencyInfo = CURRENCIES.find(
    (c) => c.code === selectedCurrency
  );

  const lookupUrl = selectedCurrency
    ? getExchangeRateLookupUrl(selectedCurrency, preferredCurrency)
    : "";

  return (
    <div className="space-y-3">
      {/* Main amount input */}
      <div className="relative">
        <Input
          type="number"
          placeholder="0.00"
          value={actualValue || ""}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="pr-16"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {preferredCurrency}
        </span>
      </div>

      {/* Currency converter toggle */}
      {!showCurrencyConverter ? (
        <button
          type="button"
          onClick={() => setShowCurrencyConverter(true)}
          className="text-xs text-primary hover:underline flex items-center gap-1"
          disabled={disabled}
        >
          💱 Entering in different currency?
        </button>
      ) : (
        <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Convert from another currency
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCloseCurrencyConverter}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Currency selector */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedCurrency ? (
                  <>
                    <span className="font-medium">{selectedCurrency}</span>
                    <span className="ml-2 text-muted-foreground">
                      {selectedCurrencyInfo?.name}
                    </span>
                  </>
                ) : (
                  "Select currency..."
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Search currency..." />
                <CommandList>
                  <CommandEmpty>No currency found.</CommandEmpty>
                  <CommandGroup className="max-h-[200px] overflow-auto">
                    {CURRENCIES.filter((c) => c.code !== preferredCurrency).map(
                      (currency) => (
                        <CommandItem
                          key={currency.code}
                          value={`${currency.code} ${currency.name}`}
                          onSelect={() => {
                            setSelectedCurrency(currency.code);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCurrency === currency.code
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <span className="font-medium">{currency.code}</span>
                          <span className="ml-2 text-muted-foreground text-xs truncate">
                            {currency.name} ({currency.symbol})
                          </span>
                        </CommandItem>
                      )
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {selectedCurrency && (
            <>
              {/* Amount and Exchange Rate inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Amount in {selectedCurrency}
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={foreignAmount}
                    onChange={(e) => setForeignAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Exchange Rate
                  </label>
                  <Input
                    type="number"
                    placeholder={`1 ${selectedCurrency} = ? ${preferredCurrency}`}
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    step="0.0001"
                  />
                </div>
              </div>

              {/* Lookup link */}
              <a
                href={lookupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Look up 1 {selectedCurrency} to {preferredCurrency} rate on Google
              </a>

              {/* Conversion result */}
              {foreignAmount &&
                exchangeRate &&
                parseFloat(foreignAmount) > 0 &&
                parseFloat(exchangeRate) > 0 && (
                  <div className="text-sm bg-primary/10 rounded-md p-2 text-center">
                    <span className="text-muted-foreground">
                      {foreignAmount} {selectedCurrency} ×{" "}
                      {parseFloat(exchangeRate).toFixed(4)} ={" "}
                    </span>
                    <span className="font-semibold text-primary">
                      {actualValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      {preferredCurrency}
                    </span>
                  </div>
                )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
