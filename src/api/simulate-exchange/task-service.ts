import { TaskStatus } from '../../core/types';
import { Task } from '../../core/interfaces/task';
import { config } from '../../core/config';

export class SimulateExchangeTaskService extends Task {
  execute() {
      throw new Error('Method not implemented.');
  }
  steps: (() => Promise<void>)[];
  private baseCurrency: string;
  private targetCurrency: string;
  private amount: number;

  constructor(id: string, baseCurrency: string, targetCurrency: string, amount: number) {
    super(id);
    this.baseCurrency = baseCurrency;
    this.targetCurrency = targetCurrency;
    this.amount = amount;
    this.steps = [
      this.validateInput.bind(this),
      this.convertCurrency.bind(this),
      this.runningSimulation.bind(this),
      this.statusUpdate.bind(this)
    ];
  }

  private async validateInput(): Promise<void> {
    this.status = TaskStatus.InProgress;
    await this.simulateStep(1000, 2000);
    if (!['USD', 'EUR', 'GBP', 'JPY'].includes(this.baseCurrency) ||
        !['USD', 'EUR', 'GBP', 'JPY'].includes(this.targetCurrency) ||
        this.amount <= 0) {
      throw new Error('Invalid input parameters');
    }
    this.payload = {
      baseCurrency: this.baseCurrency,
      targetCurrency: this.targetCurrency,
      amount: this.amount
    };
    this.progress = 0.25;
  }

  private async convertCurrency(): Promise<void> {
    await this.simulateStep(1000, 3000);
    const conversionRate = Math.random() * (1.5 - 0.5) + 0.5;
    this.result.conversionRate = conversionRate;
    this.result.exchangeAmount = this.amount * conversionRate;
    this.progress = 0.5;
  }

  private async runningSimulation(): Promise<void> {
    const duration = Math.floor(Math.random() * (20 - 5 + 1) + 5) * 1000;
    const startTime = Date.now();
    const endTime = startTime + duration;

    while (Date.now() < endTime) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const elapsedTime = Date.now() - startTime;
      this.progress = Math.min(0.9, 0.5 + (elapsedTime / duration) * 0.4);
      if (Math.random() < config.errorRate) {
        throw new Error('Random error occurred during simulation');
      }
    }
  }

  private async statusUpdate(): Promise<void> {
    await this.simulateStep(500, 1000);
    this.progress = 1;
  }

  private async simulateStep(minDuration: number, maxDuration: number): Promise<void> {
    const duration = Math.floor(Math.random() * (maxDuration - minDuration + 1) + minDuration);
    await new Promise(resolve => setTimeout(resolve, duration));
  }

  reset(): void {
    super.reset();
    this.result = {};
  }
}
