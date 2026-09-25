import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderRoute } from '@/test/render';

describe('routing', () => {
  it('renders the home page inside the public layout', async () => {
    renderRoute('/');
    expect(
      await screen.findByRole('heading', { level: 1, name: /travel smarter/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ZPROO GO home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    const services = screen.getByRole('region', { name: /our travel services/i });
    expect(within(services).getAllByRole('link')).toHaveLength(9);
  });

  it.each([
    ['/flights', 'Flights', 4],
    ['/buses/abc/seats', 'Choose seats', 5],
    ['/wallet', 'ZPROO Wallet', 13],
  ])('renders the planned page for %s', async (path, title, phase) => {
    renderRoute(path);
    expect(await screen.findByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByText(`Arriving in phase ${phase}`)).toBeInTheDocument();
  });

  it('renders auth routes in the auth layout without the site header', async () => {
    renderRoute('/login');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Welcome back' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Travel services' })).not.toBeInTheDocument();
  });

  it('renders the admin shell with the full sidebar', async () => {
    renderRoute('/admin/refunds');
    expect(await screen.findByRole('heading', { level: 1, name: 'Refunds' })).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Admin' });
    expect(within(nav).getAllByRole('link')).toHaveLength(24);
    expect(within(nav).getByRole('link', { name: 'Refunds' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('renders 404 for unknown paths, including unknown admin sections', async () => {
    renderRoute('/no-such-page');
    expect(await screen.findByRole('heading', { name: /wrong turn/i })).toBeInTheDocument();
  });

  it('renders 404 for unknown admin sections', async () => {
    renderRoute('/admin/nope');
    expect(await screen.findByRole('heading', { name: /wrong turn/i })).toBeInTheDocument();
  });

  it('opens quick search from the header and navigates to a service', async () => {
    const user = userEvent.setup();
    const { router } = renderRoute('/');
    await screen.findByRole('heading', { level: 1, name: /travel smarter/i });
    await user.click(screen.getByRole('button', { name: /search flights, buses/i }));
    await user.type(
      screen.getByRole('textbox', { name: /search services and pages/i }),
      'bus{Enter}',
    );
    await screen.findByRole('heading', { level: 1, name: 'Buses' });
    expect(router.state.location.pathname).toBe('/buses');
  });
});
