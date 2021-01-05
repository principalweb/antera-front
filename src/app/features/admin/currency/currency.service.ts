import { Injectable, OnDestroy } from '@angular/core';
import { CurrencyItem, CurrencyCreateResponse, DeleteCurrencyResponse, ConfigUpdateResponse, ExchangeRateCreateRequest, ExchangeRateUpdateResponse, ExchangeRateCreateResponse, DeleteExchangeRateResponse, SyncExchangeRateIdsResponse, SyncAllExchangeRatesResponse, ConfigResponse } from './interface/interface';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { take, map, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'app/core/services/message.service';
import { CurrencyItem as modelCurrency } from 'app/models/currency-item';
import { Settings } from "./interface/interface";
import { ExchangeRate } from 'app/models/exchange-rate';
import { AuthService } from 'app/core/services/auth.service';
import { User } from 'app/models';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import * as fromOrderForm from "app/features/e-commerce/order-form/store/order-form.reducer";
import { Store, select } from "@ngrx/store";
import * as OrderFormActions from "app/features/e-commerce/order-form/store/order-form.actions";

@Injectable({
  providedIn: "root",
})
export class CurrencyService implements Resolve<any>, OnDestroy {
  destroyed$: Subject<boolean> = new Subject<boolean>();
  currencies: BehaviorSubject<CurrencyItem[]> = new BehaviorSubject<
    CurrencyItem[]
  >([]);
  loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  currencySettings: BehaviorSubject<Settings> = new BehaviorSubject<Settings>(
    null
  );
  currencyCodes: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  exchangeRates: BehaviorSubject<ExchangeRate[]> = new BehaviorSubject<
    ExchangeRate[]
  >([]);
  productCurrencies: BehaviorSubject<{ [key: string]: string }> = new BehaviorSubject<{ [key: string]: string }>({});
  customerCurrency$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  defaultId: BehaviorSubject<string> = new BehaviorSubject<string>("");
  spin: { [key: string]: boolean } = {};

  constructor(
    private api: ApiService,
    public messageService: MessageService,
    public auth: AuthService,
    private store: Store<fromOrderForm.State>
  ) {}
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    console.log("testing resolve if running");
    //this.subscribeToCurrenciesChanged();
    this.api
      .getExchangeRateList()
      .pipe(take(1))
      .subscribe(
        (exchangeRates: ExchangeRate[]) => {
          console.log("exchange rates", exchangeRates);
          this.exchangeRates.next(exchangeRates);
          this.store.dispatch(
            new OrderFormActions.UpdateCurrency({
              exchangeRates: exchangeRates,
            })
          );
        },
        (error) => {
          console.log("Get exchange rate list error", error);
        }
      );
    this.api
      .getCurrencyListForDropDownDOnly()
      .pipe(take(1))
      .subscribe(
        (currencyItems: CurrencyItem[]) => {
          this.currencies.next(currencyItems);
          console.log("currency Items", currencyItems);
        },
        (error) => console.log("get currency list error", error)
      );
    return this.api
      .getCurrencyConfiguration()
      .pipe(take(1))
      .subscribe((res: ConfigResponse) => {
        console.log("currency settings response", res);
        this.currencySettings.next(res.settings);
        this.getBaseCurrencyCode(res.settings.baseCurrency);
        this.store.dispatch(
          new OrderFormActions.UpdateCurrency({
            currency: res.settings.baseCurrency,
            currencyEnabled: res.settings.enableCurrency === "1",
          })
        );
        console.log("Currency service fired");
      });
  }

  subscribeToCurrenciesChanged(){
    this.store.pipe(takeUntil(this.destroyed$), select(fromOrderForm.currenciesUpdated))
    .subscribe((currencies: any) => {
      this.store.dispatch( new OrderFormActions.ApplyPriceBreaksSuccess(""));
    })
  }

  ngOnDestroy(){
    this.destroyed$.next(true);
  }

  addCurrency(currencyItem: CurrencyItem): Observable<string> {
    return Observable.create((observer) => {
      const currencies = [...this.currencies.value, currencyItem];
      this.currencies.next(currencies);
      this.loading.next(true);
      this.api
        .createCurrency(currencyItem)
        .pipe(take(1))
        .subscribe(
          (res: CurrencyCreateResponse) => {
            console.log("created currency", res);
            const swappedCurrencies = this.swapCurrencyItem(
              this.currencies.value,
              currencyItem,
              new modelCurrency(res.extra)
            );
            this.currencies.next(swappedCurrencies);
            this.loading.next(false);
            console.log("this.currencies", this.currencies.value);
            observer.next("success");
            observer.complete();
          },
          (err: HttpErrorResponse) => {
            console.log("create currency error", err);
            const changeCurrencies = [...this.currencies.value];
            changeCurrencies.pop();
            this.currencies.next(changeCurrencies);
            this.loading.next(false);
            this.messageService.show(
              "There was a problem adding your currency",
              "Error"
            );
            observer.error(err);
          }
        );
    });
  }

  swapCurrencyItem(
    currencyItems: CurrencyItem[],
    oldItem: CurrencyItem,
    newItem: CurrencyItem
  ): CurrencyItem[] {
    const idx = currencyItems.findIndex(
      (searchItem: CurrencyItem) => searchItem.id === oldItem.id
    );
    currencyItems[idx] = newItem;
    return currencyItems;
  }

  removeCurrencies(ids: string[]) {
    const currencies: CurrencyItem[] = [...this.currencies.value];
    const updatedCurrencies = currencies.filter(
      (currencyItem: CurrencyItem) => !ids.includes(currencyItem.id)
    );
    this.currencies.next(updatedCurrencies);
    this.loading.next(true);
    this.api
      .deleteCurrency({ ids })
      .pipe(take(1))
      .subscribe(
        (res: DeleteCurrencyResponse) => {
          this.loading.next(false);
          const exchangeRates = [...this.exchangeRates.value];
          const toBeRemovedIds: string[] = exchangeRates
            .filter(
              (exchangeRate: ExchangeRate) =>
                ids.includes(exchangeRate.fromCurrencyId) ||
                ids.includes(exchangeRate.toCurrencyId)
            )
            .map((exchangeRate: ExchangeRate) => exchangeRate.id);
          if (toBeRemovedIds) this.deleteExchangeRate(toBeRemovedIds);
          console.log("deleted currency");
        },
        (error: HttpErrorResponse) => {
          console.log("delete currency error", error);
          this.loading.next(false);
          this.messageService.show(
            "There was an error deleting this currency",
            "Error"
          );
        }
      );
  }

  getCurrencies() {
    this.api
      .getCurrencyListForDropDownDOnly()
      .pipe(
        take(1),
        map((res: any[]) =>
          res.map(
            (individualCurrencyItem) =>
              new modelCurrency(individualCurrencyItem)
          )
        )
      )
      .subscribe((currencyItems: CurrencyItem[]) => {
        this.currencies.next(currencyItems);
        this.loading.next(false);
      });
  }

  getBaseCurrencyCode(baseCurrency: string) {
    this.currencies
      .pipe(take(1))
      .subscribe((currencyItems: CurrencyItem[]) => {
        const currencyItem = currencyItems.find(
          (searchItem: CurrencyItem) => searchItem.code === baseCurrency
        );
        if (currencyItem) {
          this.defaultId.next(currencyItem.id);
        }
      });
  }

  updateCurrency(currencyItem: CurrencyItem): Observable<string> {
    return Observable.create((observer) => {
      const currencies = [...this.currencies.value];
      const oldItem = currencies.find(
        (searchItem: CurrencyItem) => searchItem.id === currencyItem.id
      );
      const newCurrencies = this.swapCurrencyItem(
        currencies,
        oldItem,
        currencyItem
      );
      this.currencies.next(newCurrencies);
      this.loading.next(true);
      this.api
        .updateCurrency(currencyItem)
        .pipe(
          take(1),
          map((res: any) => new modelCurrency(res))
        )
        .subscribe(
          (currencyItem: CurrencyItem) => {
            this.getCurrencies();
            observer.next("success");
            observer.complete();
          },
          (error: HttpErrorResponse) => {
            console.log("Update Currency Error", error);
            this.loading.next(false);
            this.messageService.show(
              "There was an error updating this currency",
              "Error"
            );
            observer.error(error);
          }
        );
    });
  }

  updateEnableSettings(val) {
    const settings = { ...this.currencySettings.value, enableCurrency: val };
    this.api
      .changeCurrencyConfiguration(settings)
      .pipe(take(1))
      .subscribe(
        (res: ConfigUpdateResponse) => {
          console.log("update configuration", res);
          this.currencySettings.next(res.extra.settings);
        },
        (error) => {
          console.log("update enable settings error", error);
        }
      );
  }

  updateAutoUpdateSettings(val) {
    const settings = {
      ...this.currencySettings.value,
      autoUpdateCurrency: val,
    };
    this.api
      .changeCurrencyConfiguration(settings)
      .pipe(take(1))
      .subscribe(
        (res: ConfigUpdateResponse) => {
          console.log("update configuration", res);
          this.currencySettings.next(res.extra.settings);
        },
        (error) => {
          console.log("update enable settings error", error);
        }
      );
  }

  changeConfigSettings(key: string, val) {
    const settings = { ...this.currencySettings.value, [key]: val };
    this.api
      .changeCurrencyConfiguration(settings)
      .pipe(take(1))
      .subscribe(
        (res: ConfigUpdateResponse) => {
          console.log("update configuration", res);
          this.currencySettings.next(res.extra.settings);
        },
        (error) => {
          console.log("update enable settings error", error);
        }
      );
  }

  exchangeRateExists(
    fromCurrencyId: string,
    toCurrencyId: string
  ): ExchangeRate | null {
    const currentExchangeRates: ExchangeRate[] = [...this.exchangeRates.value];
    const exists = currentExchangeRates.find(
      (exchangeRate: ExchangeRate) =>
        exchangeRate.fromCurrencyId === fromCurrencyId &&
        exchangeRate.toCurrencyId === toCurrencyId
    );
    return exists;
  }

  addExchangeRate(fromCurrencyId: string, toCurrencyId: string, rate: string) {
    const user: User = this.auth.getCurrentUser();
    const modifiedExchangeRate: ExchangeRate | null = this.exchangeRateExists(
      fromCurrencyId,
      toCurrencyId
    );
    if (modifiedExchangeRate) {
      const exchangeRateRequest: ExchangeRateCreateRequest = {
        ...modifiedExchangeRate,
        fromCurrencyId,
        toCurrencyId,
        rate,
        dateModified: new Date(),
        modifiedById: user.userId,
        modifiedByName: user.fullName,
      };
      this.loading.next(true);
      this.api
        .updateExchangeRate(exchangeRateRequest)
        .pipe(take(1))
        .subscribe(
          (res: ExchangeRateUpdateResponse) => {
            this.getExchangeRatesList();
          },
          (error) => {
            console.log("Update Exchange Rate Error", error);
            this.loading.next(false);
          }
        );
    } else {
      const exchangeRateRequest: ExchangeRateCreateRequest = {
        fromCurrencyId,
        toCurrencyId,
        rate,
        dateModified: new Date(),
        modifiedById: user.userId,
        modifiedByName: user.fullName,
        dateCreated: new Date(),
        createdByName: user.fullName,
        createdById: user.userId,
      };
      this.loading.next(true);
      this.api
        .createExchangeRate(exchangeRateRequest)
        .pipe(take(1))
        .subscribe(
          (res: ExchangeRateCreateResponse) => {
            this.getExchangeRatesList();
          },
          (error) => {
            console.log("Create Exchange Rate Error", error);
            this.loading.next(false);
          }
        );
    }
  }

  deleteExchangeRate(ids: string[]) {
    this.loading.next(true);
    this.api
      .deleteExchangeRate({ ids })
      .pipe(take(1))
      .subscribe(
        (res: DeleteExchangeRateResponse) => {
          this.getExchangeRatesList();
        },
        (error) => {
          console.log("Delete Exchange Rate Error", error);
          this.loading.next(false);
        }
      );
  }

  getExchangeRatesList() {
    this.api
      .getExchangeRateList()
      .pipe(take(1))
      .subscribe(
        (exchangeRates: ExchangeRate[]) => {
          console.log("exchange rates", exchangeRates);
          this.exchangeRates.next(exchangeRates);
          this.loading.next(false);
        },
        (error) => {
          console.log("Get exchange rate list error", error);
          this.loading.next(false);
        }
      );
  }

  listenToExchangeRatesList(): Observable<string> | null {
    return Observable.create((observer) => {
      if (!this.exchangeRates.value.length) {
        this.api
          .getExchangeRateList()
          .pipe(take(1))
          .subscribe(
            (exchangeRates: ExchangeRate[]) => {
              console.log("exchange rates", exchangeRates);
              this.exchangeRates.next(exchangeRates);
              observer.next("success");
              this.loading.next(false);
            },
            (error) => {
              console.log("Get exchange rate list error", error);
              this.loading.next(false);
            }
          );
      } else {
        observer.next("success");
      }
    });
  }

  syncExchangeRateIds(exchangeRateIds: string[]) {
    this.loading.next(true);
    this.spin[exchangeRateIds[0]] = true;
    this.api
      .syncIdsExchangeRate({ exchangeRateIds })
      .pipe(take(1))
      .subscribe(
        (res: SyncExchangeRateIdsResponse) => {
          this.loading.next(false);
          this.spin[exchangeRateIds[0]] = false;
          this.getExchangeRatesList();
          this.messageService.show("Exchange Rate Synced", "Success");
        },
        (error) => {
          console.log("Sync Exchange Rates Error", error);
          this.loading.next(false);
          this.spin[exchangeRateIds[0]] = false;
          this.messageService.show("Error Updating Exchange Rate", "Error");
        }
      );
  }

  syncAllExchangeRates() {
    this.api
      .syncAllExchangeRate()
      .pipe(take(1))
      .subscribe(
        (res: SyncAllExchangeRatesResponse) => {
          this.loading.next(false);
          this.getExchangeRatesList();
          this.messageService.show("Exchange Rates Synced", "Success");
        },
        (error) => {
          console.log("Sync All Exchange Rates Error", error);
          this.loading.next(true);
          this.messageService.show("Error Updating Exchange Rates", "Error");
        }
      );
  }
}
