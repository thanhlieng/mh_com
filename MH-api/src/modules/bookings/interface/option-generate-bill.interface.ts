import { Browser } from 'puppeteer';

export interface IOptionGenerateBill {
  isGenerateManifest?: boolean;
  browser?: Browser;
}
