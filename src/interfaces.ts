export type Theme = "light" | "dark"

export type Orientation = "horizontal" | "vertical"

export interface iframeWrapperParams {
  appId: string;
  network: string;
}

export interface widgetThemeConfig {
  assets: {
    logo_vertical_light: string,
    logo_vertical_dark: string,
    logo_horizontal_light: string,
    logo_horizontal_dark: string,
  },
  theme: string
}

export interface IConnectionMethods {
  isLoggedIn: () => Promise<boolean>;
  triggerLogin: (t: string) => Promise<void>;
  sendRequest: (req: any) => Promise<void>;
}

export interface ITypedDataMessage {
  name: string;
  type: string;
  value: string;
}

export interface IMessageParams {
  from: string;
  data: string | ITypedDataMessage[];
}
