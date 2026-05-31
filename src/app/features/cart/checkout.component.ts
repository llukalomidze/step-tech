import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { switchMap } from "rxjs";
import { CartService } from "../../core/services/cart.service";
import { OrderService } from "../../core/services/order.service";
import { AuthService } from "../../core/services/auth.service";
import { ToastService } from "../../core/services/toast.service";
import { environment } from "../../../environments/environment";
import { CurrencyGelPipe } from "../../shared/pipes/currency-gel.pipe";
import { TranslatePipe } from "../../shared/pipes/translate.pipe";
import { ButtonComponent } from "../../shared/components/button.component";
import { luhnValidator, nonEmptyTrimmedValidator } from "../../shared/validators/luhn.validator";
import { OrderPaymentMethod, SavedOrder } from "../../core/models/order.model";

@Component({
  selector: "app-checkout",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CurrencyGelPipe, ButtonComponent, TranslatePipe],
  templateUrl: "./checkout.component.html",
  styleUrl: "./checkout.component.scss",
})
export class CheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cart = inject(CartService);
  private readonly orders = inject(OrderService);
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly cartRef = this.cart;
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    firstName: ["", [Validators.required, nonEmptyTrimmedValidator(), Validators.minLength(2)]],
    lastName: ["", [Validators.required, nonEmptyTrimmedValidator(), Validators.minLength(2)]],
    email: ["", [Validators.required, Validators.email]],
    phone: ["", [Validators.required, Validators.pattern(/^\+?[0-9\s-]{7,15}$/)]],
    address: ["", [Validators.required, Validators.minLength(8)]],
    paymentMethod: this.fb.nonNullable.control<OrderPaymentMethod>("card", Validators.required),
    cardNumber: ["", [luhnValidator()]],
    cardExpiry: ["", [Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cardCvc: ["", [Validators.pattern(/^\d{3,4}$/)]],
  });

  readonly cardRequired = computed(() => this.form.controls.paymentMethod.value === "card");

  ngOnInit(): void {
    const email = this.auth.userEmail();
    if (email) this.form.patchValue({ email });

    this.form.controls.paymentMethod.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((method) => {
      const c = this.form.controls;
      if (method === "card") {
        c.cardNumber.addValidators([Validators.required, luhnValidator()]);
        c.cardExpiry.addValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]);
        c.cardCvc.addValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
      } else {
        c.cardNumber.clearValidators();
        c.cardExpiry.clearValidators();
        c.cardCvc.clearValidators();
      }
      c.cardNumber.updateValueAndValidity();
      c.cardExpiry.updateValueAndValidity();
      c.cardCvc.updateValueAndValidity();
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error("Please fix the highlighted fields.");
      return;
    }
    if (this.cart.isEmpty()) {
      this.toast.error("Your bag is empty.");
      return;
    }

    this.submitting.set(true);

    const v = this.form.getRawValue();
    this.orders
      .saveShippingProfile({
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        phoneNumber: v.phone,
        address: v.address,
      })
      .pipe(
        switchMap(() => this.cart.syncAndCheckout()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.completeOrder(),
        error: () => this.submitting.set(false),
      });
  }

  private completeOrder(): void {
    const v = this.form.getRawValue();
    const order: SavedOrder = {
      id: this.makeOrderId(),
      placedAt: new Date().toISOString(),
      items: [...this.cart.items()],
      subtotal: this.cart.subtotal(),
      shipping: this.cart.shipping(),
      total: this.cart.total(),
      contact: {
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        phone: v.phone,
        address: v.address,
      },
      paymentMethod: v.paymentMethod,
      isGuest: false,
    };
    this.orders.persistLocal(order);
    // Frontend fallback: send order details to n8n webhook (non-blocking).
    try {
      void fetch(environment.n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: order.contact.email,
          customerName: `${order.contact.firstName} ${order.contact.lastName}`,
          orderId: order.id,
          orderDate: order.placedAt,
          totalAmount: String(order.total),
          items: order.items.map((i) => ({ product: i.name, quantity: i.quantity, price: String(i.price) })),
        }),
      }).catch(() => {
        /* ignore webhook errors */
      });
    } catch {
      /* ignore */
    }
    this.cart.clear();
    this.submitting.set(false);
    this.toast.success("Order placed. Thank you.");
    void this.router.navigate(["/order-confirmed", order.id]);
  }

  private makeOrderId(): string {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `ST-${ts}-${rand}`;
  }
}
