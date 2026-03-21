import { createApp } from '../../app';
import financeRoutes from './finance.router';
import financeWebhookRoutes from './finance.webhook.router';

function getRoutePaths(router: any): string[] {
  return router.stack
    .filter((layer: any) => layer.route?.path)
    .map((layer: any) => layer.route.path);
}

describe('Finance webhook routing', () => {
  it('déclare le webhook public sur /payment dans le routeur dédié', () => {
    expect(getRoutePaths(financeWebhookRoutes)).toContain('/payment');
  });

  it("n'expose plus /webhooks/payment dans le routeur finance protégé", () => {
    expect(getRoutePaths(financeRoutes)).not.toContain('/webhooks/payment');
  });

  it('monte le routeur public webhook sur le préfixe /api/v1/finance/webhooks', () => {
    const app = createApp();
    const stack = (app as any)._router?.stack ?? [];

    const hasWebhookMount = stack.some((layer: any) =>
      layer.name === 'router' && String(layer.regexp).includes('finance\\/webhooks'),
    );

    expect(hasWebhookMount).toBe(true);
  });
});
