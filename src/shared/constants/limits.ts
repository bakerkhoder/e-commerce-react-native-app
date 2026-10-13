/**
 * Input limits shared by every form.
 *
 * These mirror the Bean Validation constraints on the backend DTOs and the caps in
 * CartService. Keeping them here means a form can block or trim input before the
 * request is sent, so the user never meets a 400 for something the UI could have
 * prevented — while the API still enforces the same rules if it is called directly.
 */

/** ProductRequest.name, and the product form's title field. */
export const MAX_NAME = 150;
/** RegisterRequest.fullName / CheckoutRequest.fullName / SellerApplication business name. */
export const MAX_FULL_NAME = 100;
export const MAX_EMAIL = 254;
export const MIN_PASSWORD = 8;
/** BCrypt only reads the first 72 bytes, so RegisterRequest rejects anything longer. */
export const MAX_PASSWORD = 72;
export const MAX_PHONE = 30;
export const MAX_CITY = 100;
export const MAX_ADDRESS = 255;
/** ProductRequest.description. */
export const MAX_DESCRIPTION = 2000;
/** ProductRequest.unit. */
export const MAX_UNIT = 20;
/** CheckoutRequest.notes / GuestCheckoutRequest.notes. */
export const MAX_NOTES = 500;
/** Category name. */
export const MAX_CATEGORY = 100;
/** Search query and assistant question — each one triggers a paid model call. */
export const MAX_QUERY = 200;
/** Guests may not exceed this per line; matches CartService's 1..99 rule. */
export const MAX_QUANTITY = 99;
/** ProductService.addImage rejects the 11th photo. */
export const MAX_PHOTOS = 10;
