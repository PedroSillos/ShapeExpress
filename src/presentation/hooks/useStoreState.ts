export const useStoreState = (
  currentUser: { email: string } | null,
  token: string | null,
) => {

  const getProtocols = async () => [];
  const createProtocol = async (_p: any) => {};
  const getPurchasedProtocols = async () => [];

  const createCheckoutSession = async (id: string) => {
    const res = await fetch("/api/checkout/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ''}`,
      },
      body: JSON.stringify({ protocolId: id }),
    });
    return res.json();
  };

  const verifyCheckoutSession = async (sid: string, pid: string) => {
    const res = await fetch("/api/checkout/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ''}`,
      },
      body: JSON.stringify({ sessionId: sid, protocolId: pid }),
    });
    return res.json();
  };

  return {
    getProtocols, createProtocol, getPurchasedProtocols,
    createCheckoutSession, verifyCheckoutSession,
  };
};
