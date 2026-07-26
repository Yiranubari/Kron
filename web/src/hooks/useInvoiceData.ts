import { useEffect, useState } from 'react';
import { fetchPortalData, type PortalData } from '../api/client';

type InvoiceDataState =
  | { status: 'loading' }
  | { status: 'success'; data: PortalData }
  | { status: 'error'; message: string };

function friendlyMessage(statusCode: string): string {
  switch (statusCode) {
    case '404':
      return "We couldn't find that invoice. Double check the link and try again.";
    case '500':
      return 'Something went wrong on our end. Please try again in a moment.';
    default:
      return 'We had trouble loading your invoice. Please refresh the page or try again later.';
  }
}

export function useInvoiceData(invoiceId: string | undefined): InvoiceDataState {
  const [state, setState] = useState<InvoiceDataState>({ status: 'loading' });

  useEffect(() => {
    if (!invoiceId) {
      setState({ status: 'error', message: "No invoice ID was provided. Make sure you're using the correct link." });
      return;
    }

    let cancelled = false;

    setState({ status: 'loading' });

    fetchPortalData(invoiceId)
      .then((data) => {
        if (!cancelled) {
          setState({ status: 'success', data });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const code = err instanceof Error ? err.message : '';
          setState({ status: 'error', message: friendlyMessage(code) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [invoiceId]);

  return state;
}
