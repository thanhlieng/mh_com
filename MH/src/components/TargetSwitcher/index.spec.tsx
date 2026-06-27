import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import TargetSwitcher from './index';
import activeTargetReducer, {
  ActiveTargetState,
  setActiveTarget,
} from '@/store/slices/activeTargetSlice';
import { queryClient } from '@/lib/queryClient';

/**
 * Component tests cho TargetSwitcher (segmented pills).
 *
 * Verify hành vi UI + side-effects (queryClient.resetQueries, dispatch setActiveTarget).
 */

// Mock queryClient để spy lời gọi resetQueries() khi user switch target.
jest.mock('@/lib/queryClient', () => ({
  queryClient: {
    resetQueries: jest.fn(),
  },
}));

// Mock antd notification để không log ra console khi test.
jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  return {
    ...actual,
    notification: {
      ...actual.notification,
      success: jest.fn(),
    },
  };
});

const buildStore = (preloaded: Partial<ActiveTargetState>) => {
  const initial: ActiveTargetState = {
    current: null,
    availableTargets: [],
    accountType: null,
    ...preloaded,
  };
  return configureStore({
    reducer: { activeTarget: activeTargetReducer },
    preloadedState: { activeTarget: initial },
  });
};

const renderWithStore = (state: Partial<ActiveTargetState>) => {
  const store = buildStore(state);
  const dispatchSpy = jest.spyOn(store, 'dispatch');
  const utils = render(
    <Provider store={store}>
      <TargetSwitcher />
    </Provider>,
  );
  return { ...utils, store, dispatchSpy };
};

describe('TargetSwitcher', () => {
  beforeEach(() => {
    (queryClient.resetQueries as jest.Mock).mockClear();
  });

  it('không render gì khi availableTargets có 1 phần tử', () => {
    const { container } = renderWithStore({
      current: 'mhvn',
      accountType: 'supplier',
      availableTargets: [{ a_target: 'mhvn', entity_ids: ['12'] }],
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('không render khi availableTargets rỗng', () => {
    const { container } = renderWithStore({
      current: null,
      accountType: null,
      availableTargets: [],
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('không render khi current=null dù có nhiều target (chưa hydrate xong)', () => {
    const { container } = renderWithStore({
      current: null,
      accountType: 'supplier',
      availableTargets: [
        { a_target: 'mhvn', entity_ids: ['12', '18'] },
        { a_target: 'gp', entity_ids: ['7'] },
      ],
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('render 2 pills với label NCC cho supplier — pill MHVN đang active', () => {
    renderWithStore({
      current: 'mhvn',
      accountType: 'supplier',
      availableTargets: [
        { a_target: 'mhvn', entity_ids: ['12', '18'] },
        { a_target: 'gp', entity_ids: ['7'] },
      ],
    });
    const mhvnPill = screen.getByRole('radio', { checked: true });
    expect(mhvnPill).toHaveTextContent('MHVN');
    expect(mhvnPill).toHaveTextContent('2 NCC');

    const gpPill = screen.getByRole('radio', { checked: false });
    expect(gpPill).toHaveTextContent('GP');
    expect(gpPill).toHaveTextContent('1 NCC');
  });

  it('render label KH cho customer', () => {
    renderWithStore({
      current: 'gp',
      accountType: 'customer',
      availableTargets: [
        { a_target: 'mhvn', entity_ids: ['100', '101'] },
        { a_target: 'gp', entity_ids: ['200'] },
      ],
    });
    const active = screen.getByRole('radio', { checked: true });
    expect(active).toHaveTextContent('GP');
    expect(active).toHaveTextContent('1 KH');
  });

  it('khi user click pill khác → dispatch setActiveTarget và queryClient.resetQueries()', () => {
    const { store, dispatchSpy } = renderWithStore({
      current: 'mhvn',
      accountType: 'supplier',
      availableTargets: [
        { a_target: 'mhvn', entity_ids: ['12', '18'] },
        { a_target: 'gp', entity_ids: ['7'] },
      ],
    });

    const gpPill = screen.getByRole('radio', { checked: false });
    fireEvent.click(gpPill);

    expect(dispatchSpy).toHaveBeenCalledWith(setActiveTarget('gp'));
    expect(queryClient.resetQueries).toHaveBeenCalledTimes(1);
    expect(store.getState().activeTarget.current).toBe('gp');
  });

  it('khi user click pill trùng với current → không dispatch và không reset cache', () => {
    const { dispatchSpy } = renderWithStore({
      current: 'mhvn',
      accountType: 'supplier',
      availableTargets: [
        { a_target: 'mhvn', entity_ids: ['12'] },
        { a_target: 'gp', entity_ids: ['7'] },
      ],
    });

    const activePill = screen.getByRole('radio', { checked: true });
    fireEvent.click(activePill);

    const setActiveCalls = dispatchSpy.mock.calls.filter(
      (c) =>
        typeof c[0] === 'object' &&
        c[0] !== null &&
        (c[0] as { type?: string }).type === setActiveTarget.type,
    );
    expect(setActiveCalls).toHaveLength(0);
    expect(queryClient.resetQueries).not.toHaveBeenCalled();
  });
});
