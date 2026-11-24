import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, SyntheticEvent } from 'react';
import {
  CAPTACION_SECTIONS,
  ALL_FIELDS,
  buildPayload,
  emptyValues,
  formatMoney,
  isVisible,
  labelOf,
  validate,
} from './captacionFields';
import type { FieldDef, FormErrors, FormValues } from './captacionFields';

const inputBase =
  'w-full rounded-lg border bg-white px-4 py-3 text-text-primary focus:outline-none focus:ring-2';
const inputOk = 'border-border focus:border-primary focus:ring-primary/20';
const inputBad = 'border-error focus:border-error focus:ring-error/20';

/** Limpia lo que se escribe según el tipo de campo (mismo criterio que el portal). */
function sanitize(f: FieldDef, raw: string): string {
  if (f.type === 'money') return raw.replace(/\D/g, '').replace(/^0+/, '').slice(0, 12);
  if (f.type === 'number') return raw.replace(/[^\d.,]/g, '').slice(0, 10);
  if (f.type === 'tel') return raw.replace(/[^\d+\s()-]/g, '').slice(0, 20);
  return raw;
}

export default function CaptacionForm() {
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Los botones "Registrar mi inmueble" de las tarjetas Venta/Arriendo preseleccionan la operación.
  useEffect(() => {
    const onOperacion = (e: Event) => {
      const value = (e as CustomEvent<unknown>).detail;
      const field = ALL_FIELDS.find((f) => f.name === 'operacion');
      if (typeof value !== 'string' || !field?.options?.some((o) => o.value === value)) return;
      setValues((prev) => ({ ...prev, operacion: value }));
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.operacion;
        return copy;
      });
    };
    window.addEventListener('captacion:operacion', onOperacion);
    return () => window.removeEventListener('captacion:operacion', onOperacion);
  }, []);

  const setField = (f: FieldDef, raw: string) => {
    const next = { ...values, [f.name]: sanitize(f, raw) };
    setValues(next);
    // Una vez que hay un error visible (o ya se intentó enviar), se revalida mientras escribe.
    if (errors[f.name] || submitted) {
      const all = validate(next);
      setErrors((prev) => {
        const copy = { ...prev };
        // Cambiar un campo puede mostrar u ocultar otros (precio/canon, tipo de documento).
        for (const field of ALL_FIELDS) {
          if (field.name === f.name || prev[field.name] || field.showWhen?.field === f.name) {
            if (all[field.name]) copy[field.name] = all[field.name];
            else delete copy[field.name];
          }
        }
        return copy;
      });
    }
  };

  const blurField = (f: FieldDef) => {
    if (!isVisible(f, values)) return;
    const err = validate(values)[f.name];
    setErrors((prev) => {
      const copy = { ...prev };
      if (err) copy[f.name] = err;
      else delete copy[f.name];
      return copy;
    });
  };

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validate(values);
    setErrors(found);

    const firstInvalid = ALL_FIELDS.find((f) => found[f.name]);
    if (firstInvalid) {
      const el = formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid.name}"]`);
      el?.focus();
      return;
    }

    const payload = buildPayload(values);
    // TODO: connect to API
    console.log('Captación (payload):', payload);
    setDone(true);
  };

  const reset = () => {
    setValues(emptyValues());
    setErrors({});
    setSubmitted(false);
    setDone(false);
  };

  if (done) {
    return (
      <div role="status" className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm md:p-10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="font-heading text-xl font-bold text-text-primary">¡Recibimos tu inmueble!</h3>
        <p className="mt-2 text-text-secondary">Un asesor te contactará pronto.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 cursor-pointer text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Registrar otro inmueble
        </button>
      </div>
    );
  }

  const errorCount = Object.keys(errors).length;

  const renderControl = (f: FieldDef) => {
    const id = `cap-${f.name}`;
    const value = values[f.name] ?? '';
    const err = errors[f.name];
    const describedBy = [err ? `${id}-error` : '', f.hint ? `${id}-hint` : ''].filter(Boolean).join(' ') || undefined;
    const common = {
      id,
      name: f.name,
      'aria-invalid': err ? true : undefined,
      'aria-describedby': describedBy,
      'aria-required': f.required || undefined,
      onBlur: () => blurField(f),
    } as const;
    const cls = `${inputBase} ${err ? inputBad : inputOk}`;

    switch (f.type) {
      case 'select':
        return (
          <select
            {...common}
            value={value}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setField(f, e.target.value)}
            className={cls}
          >
            <option value="">Selecciona una opción</option>
            {f.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            {...common}
            rows={3}
            maxLength={f.maxLength}
            value={value}
            placeholder={f.placeholder}
            onChange={(e) => setField(f, e.target.value)}
            className={cls}
          />
        );
      case 'money':
        return (
          <input
            {...common}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="$ 0"
            value={formatMoney(value)}
            onChange={(e) => setField(f, e.target.value)}
            className={cls}
          />
        );
      case 'number':
        return (
          <input
            {...common}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={value}
            onChange={(e) => setField(f, e.target.value)}
            className={cls}
          />
        );
      default:
        return (
          <input
            {...common}
            type={f.type}
            inputMode={f.type === 'tel' ? 'tel' : undefined}
            autoComplete={
              f.name === 'propNombre' ? 'name' : f.type === 'email' ? 'email' : f.type === 'tel' ? 'tel' : 'off'
            }
            maxLength={f.maxLength}
            value={value}
            placeholder={f.placeholder}
            onChange={(e) => setField(f, e.target.value)}
            className={cls}
          />
        );
    }
  };

  const renderField = (f: FieldDef) => {
    if (!isVisible(f, values)) return null;
    const id = `cap-${f.name}`;
    const err = errors[f.name];
    const wrapper = f.wide ? 'md:col-span-2' : '';
    const label = labelOf(f, values);
    const star = f.required ? (
      <span className="text-error" aria-hidden="true">
        {' '}
        *
      </span>
    ) : null;
    const messages = (
      <>
        {f.hint && !err && (
          <p id={`${id}-hint`} className="mt-1 text-xs text-text-muted">
            {f.hint}
          </p>
        )}
        {err && (
          <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-error">
            {err}
          </p>
        )}
      </>
    );

    if (f.type === 'radio') {
      return (
        <fieldset
          key={f.name}
          className={wrapper}
          aria-describedby={err ? `${id}-error` : undefined}
        >
          <legend className="mb-1 block text-sm font-medium text-text-secondary">
            {label}
            {star}
          </legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {f.options?.map((o, i) => {
              const checked = values[f.name] === o.value;
              return (
                <label
                  key={o.value}
                  className={`flex cursor-pointer items-center justify-center rounded-lg border px-4 py-3 text-sm font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/30 ${
                    checked
                      ? 'border-primary bg-primary text-white'
                      : err
                        ? 'border-error bg-white text-text-primary hover:border-primary/50'
                        : 'border-border bg-white text-text-primary hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name={f.name}
                    value={o.value}
                    checked={checked}
                    aria-required={f.required || undefined}
                    aria-invalid={err && i === 0 ? true : undefined}
                    onChange={() => setField(f, o.value)}
                    onBlur={() => blurField(f)}
                    className="sr-only"
                  />
                  {o.label}
                </label>
              );
            })}
          </div>
          {messages}
        </fieldset>
      );
    }

    return (
      <div key={f.name} className={wrapper}>
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-text-secondary">
          {label}
          {star}
        </label>
        {renderControl(f)}
        {messages}
      </div>
    );
  };

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      className="space-y-8 rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8"
    >
      {CAPTACION_SECTIONS.map((section, index) => (
        <fieldset key={section.id} className="min-w-0">
          <legend className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              {index + 1}
            </span>
            <span className="font-heading text-lg font-bold text-text-primary">{section.title}</span>
          </legend>
          <p className="mt-2 text-sm text-text-secondary">{section.description}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">{section.fields.map(renderField)}</div>
        </fieldset>
      ))}

      {submitted && errorCount > 0 && (
        <p role="alert" className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          Revisa {errorCount === 1 ? 'el campo marcado' : `los ${errorCount} campos marcados`} antes de enviar.
        </p>
      )}

      <button
        type="submit"
        className="w-full cursor-pointer rounded-lg bg-accent py-3 font-semibold text-white shadow-md transition-colors hover:bg-accent/90"
      >
        Enviar mi inmueble
      </button>
      <p className="text-center text-xs text-text-muted">Los campos con * son obligatorios.</p>
    </form>
  );
}
