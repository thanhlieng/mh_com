export interface IAction {
  action: string;
  description: string;
  selected: boolean;
}

export interface IActionModule {
  module_name: string;
  actions: IAction[];
}
