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
 * Component tests cho TargetSwitcher.
 *
 * Verify hành vi UI + side-effects (queryClient.clear, dispatch setActiveTarget).
 */

// Mock queryClient để spy lời gọi clear() khi user switch target.
jest.mock('@/lib/queryClient', () => ({
  queryClient: {
    clear: jest.fn(),
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
    (queryClient.clear as jest.Mock).mockClear();
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

  it('render dropdown với label NCC cho supplier — current=mhvn hiển thị "MHVN (2 NCC)"', () => {
    renderWithStore({
      current: 'mhvn',
      accountType: 'supplier',
      availableTargets: [
        { a_target: 'mhvn', entity_ids: ['12', '18'] },
        { a_target: 'gp', entity_ids: ['7'] },
      ],
    });
    // Selected value text hiển thị trên trigger
    expect(screen.getByText('MHVN (2 NCC)')).toBeInTheDocument();
  });

  it('render dropdown với label KH cho customer', () => {
    renderWithStore({
      current: 'gp',
      accountType: 'customer',
      availableTargets: [
        { a_target: 'mhvn', entity_ids: ['100', '101'] },
        { a_target: 'gp', entity_ids: ['200'] },
      ],
    });
    expect(screen.getByText('GP (1 KH)')).toBeInTheDocument();
  });

  it('khi user chọn target khác → dispatch setActiveTarget và queryClient.clear()', () => {
    const { store, dispatchSpy } = renderWithStore({
      current: 'mhvn',
      accountType: 'supplier',
      availableTargets: [
        { a_target: 'mhvn', entity_ids: ['12', '18'] },
        { a_target: 'gp', entity_ids: ['7'] },
      ],
    });

    // antd Select v4 dropdown nằm trong body; click vào trigger trước.
    const trigger = screen.getByText('MHVN (2 NCC)').closest('.ant-select');
    expect(trigger).toBeTruthy();
    fireEvent.mouseDown(trigger!.querySelector('.ant-select-selector')!);

    // Sau khi mở dropdown, các option mới render.
    const gpOption = document.querySelector(
      '.ant-select-item-option[title="GP (1 KH)"], .ant-select-item-option[title="GP (1 NCC)"]',
    );
    expect(gpOption).not.toBeNull();
    fireEvent.click(gpOption!);

    expect(dispatchSpy).toHaveBeenCalledWith(setActiveTarget('gp'));
    expect(queryClient.clear).toHaveBeenCalledTimes(1);
    expect(store.getState().activeTarget.current).toBe('gp');
  });

  it('khi user chọn target trùng với current → không dispatch và không clear cache', () => {
    const { dispatchSpy } = renderWithStore({
      current: 'mhvn',
      accountType: 'supplier',
      availableTargets: [
        { a_target: 'mhvn', entity_ids: ['12'] },
        { a_target: 'gp', entity_ids: ['7'] },
      ],
    });

    const trigger = screen.getByText('MHVN (1 NCC)').closest('.ant-select');
    fireEvent.mouseDown(trigger!.querySelector('.ant-select-selector')!);

    const mhvnOption = document.querySelector(
      '.ant-select-item-option[title="MHVN (1 NCC)"]',
    );
    expect(mhvnOption).not.toBeNull();
    fireEvent.click(mhvnOption!);

    // dispatchSpy có thể được gọi cho action nội bộ antd; chỉ assert
    // setActiveTarget KHÔNG bị gọi và queryClient KHÔNG bị clear.
    const setActiveCalls = dispatchSpy.mock.calls.filter(
      (c) =>
        typeof c[0] === 'object' &&
        c[0] !== null &&
        (c[0] as { type?: string }).type === setActiveTarget.type,
    );
    expect(setActiveCalls).toHaveLength(0);
    expect(queryClient.clear).not.toHaveBeenCalled();
  });
});
