import { useState } from 'react';
import { User, Mail, Phone, MessageSquare, Send } from 'lucide-react';

interface ContactFormProps {
  propertyId?: string;
  propertyTitle: string;
  agentName?: string;
  agentPhone?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export default function ContactForm({ propertyTitle, agentName, agentPhone }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: `Me interesa la propiedad: ${propertyTitle}`,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(): FormErrors {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es obligatorio';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo valido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es obligatorio';
    }

    return newErrors;
  }

  function handleChange(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSending(true);
    setError(null);

    try {
      const webhookUrl = import.meta.env.PUBLIC_GHL_WEBHOOK_URL;

      if (!webhookUrl) {
        throw new Error('Webhook URL no configurada');
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          message: formData.message.trim(),
          source: 'Contacto Propiedad',
          solicitud_type: 'Buscar Propiedad',
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar el formulario');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el formulario. Intenta nuevamente.');
    } finally {
      setSending(false);
    }
  }

  const whatsappNumber = agentPhone
    ? agentPhone.replace(/\D/g, '')
    : '';

  const whatsappMessage = encodeURIComponent(
    `Hola${agentName ? ` ${agentName}` : ''}, me interesa la propiedad: ${propertyTitle}`
  );

  if (submitted) {
    return (
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 shadow-sm">
        <div className="flex flex-col items-center text-center gap-4 py-6">
          <div className="w-16 h-16 bg-[var(--color-success)]/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Mensaje enviado
          </h3>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Gracias por tu interes. Te contactaremos pronto.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                message: `Me interesa la propiedad: ${propertyTitle}`,
              });
            }}
            className="text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] text-sm font-medium underline cursor-pointer"
          >
            Enviar otro mensaje
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 font-[var(--font-family-heading)]">
        Solicitar información
      </h3>

      {/* Agent info */}
      {agentName && (
        <div className="flex items-center gap-3 mb-5 p-3 bg-[var(--color-surface)] rounded-lg">
          <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{agentName}</p>
            {agentPhone && (
              <p className="text-xs text-[var(--color-text-secondary)] truncate">{agentPhone}</p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Error message */}
        {error && (
          <div className="p-3 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-lg">
            <p className="text-sm text-[var(--color-error)]">{error}</p>
          </div>
        )}

        {/* First Name */}
        <div>
          <label htmlFor="contact-firstName" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Nombre
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              <User className="w-4 h-4" />
            </div>
            <input
              id="contact-firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="Tu nombre"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/30 focus:border-[var(--color-secondary)] ${
                errors.firstName ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'
              }`}
            />
          </div>
          {errors.firstName && (
            <p className="mt-1 text-xs text-[var(--color-error)]">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="contact-lastName" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Apellido
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              <User className="w-4 h-4" />
            </div>
            <input
              id="contact-lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Tu apellido"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/30 focus:border-[var(--color-secondary)] ${
                errors.lastName ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'
              }`}
            />
          </div>
          {errors.lastName && (
            <p className="mt-1 text-xs text-[var(--color-error)]">{errors.lastName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Correo electronico
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="contact-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="tu@email.com"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/30 focus:border-[var(--color-secondary)] ${
                errors.email ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-[var(--color-error)]">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="contact-phone" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Teléfono
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              <Phone className="w-4 h-4" />
            </div>
            <input
              id="contact-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+57 300 123 4567"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/30 focus:border-[var(--color-secondary)] ${
                errors.phone ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'
              }`}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-xs text-[var(--color-error)]">{errors.phone}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label htmlFor="contact-message" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Mensaje
          </label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-[var(--color-text-muted)]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <textarea
              id="contact-message"
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              rows={4}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm transition-colors resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/30 focus:border-[var(--color-secondary)] ${
                errors.message ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'
              }`}
            />
          </div>
          {errors.message && (
            <p className="mt-1 text-xs text-[var(--color-error)]">{errors.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={sending}
          className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sending ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Enviar mensaje
            </>
          )}
        </button>
      </form>

      {/* WhatsApp direct link */}
      {whatsappNumber && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-lg transition-colors text-sm"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Contactar por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
