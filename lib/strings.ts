/**
 * Every piece of static UI copy lives here (i18n-ready: swap this module
 * for a translation layer later). Plain language only — no status codes,
 * no jargon, no abbreviations. Screens add their sections as they are
 * redesigned (P2–P4).
 */
export const STRINGS = {
  common: {
    deliverTo: 'Deliver to',
    retry: 'Try again',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    continue: 'Continue',
    back: 'Go back',
    close: 'Close',
    loading: 'Loading…',
    browseStores: 'Browse stores',
    // Store groups, not products: every store row now carries filler products that did not
    // match the query, so counting products would inflate the number past what matched.
    storesFor: (count: number, query: string) =>
      `${count} store${count !== 1 ? 's' : ''} for "${query}"`,
  },
  tabs: {
    home: 'Home',
    explore: 'Explore',
    orders: 'Orders',
    profile: 'Profile',
  },
  auth: {
    /* Shown at the top of sign-in and create-account when the customer was sent
       there by something they were already doing, so the screen explains itself
       instead of looking like an interruption. */
    reasons: {
      checkout: 'Sign in to place your order. Your basket is saved and waiting.',
      account: 'Sign in to continue.',
    },
    invalidPhone: 'Enter a valid Ghana phone number',
    invalidEmail: 'Enter a valid email address',
    passwordRequiredError: 'Enter your password',
    phoneDigitsPlaceholder: '241234567',
    emailPlaceholder: 'e.g. name@example.com',
    signin: {
      title: 'Welcome back',
      subtitle: 'Sign in to track your orders and reorder in seconds.',
      phoneTab: 'Phone',
      emailTab: 'Email',
      phoneNumberLabel: 'Phone number',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      forgotPassword: 'Forgot password?',
      continueCta: 'Continue',
      signingIn: 'Signing in…',
      termsAgreement: 'By signing in, you agree to our',
      termsOfService: 'Terms of Service',
      and: 'and',
      privacyPolicy: 'Privacy Policy.',
      noAccountPrompt: "Don't have an account?",
      createAccountCta: 'Create account',
    },
    register: {
      title: 'Create your account',
      subtitle: 'Just a few details and you can start ordering.',
      fullNameLabel: 'Full name',
      fullNamePlaceholder: 'e.g. Kwasi Yeboah',
      emailLabel: 'Email',
      phoneNumberLabel: 'Phone number',
      passwordLabel: 'Password',
      fullNameTooShort: 'Please enter your full name',
      passwordTooShort: 'Use at least 6 characters for your password',
      termsCheckboxLabel: 'I agree to the terms and conditions.',
      termsRequired: 'You must accept the terms and conditions',
      createAccountCta: 'Create account',
      creatingAccount: 'Creating your account…',
      alreadyHaveAccount: 'Already have an account?',
      signInCta: 'Sign in',
    },
    forgotPassword: {
      title: 'Reset your password',
      subtitle: "Step 1 of 2. Enter your phone number and we'll text you a reset code.",
      phoneNumberLabel: 'Phone number',
      sendCodeCta: 'Send reset code',
      sendingCode: 'Sending your code…',
      resendPrompt: "Didn't receive a code?",
      resendCta: 'Resend code',
      resendCtaCountdown: (seconds: number) => `Resend code (${seconds}s)`,
      resendingToast: 'Sending a new code…',
      resendSuccessToast: 'New code sent!',
      resendErrorToast: 'Could not resend the code. Please try again.',
      otp: {
        title: 'Check your phone',
        subtitle: 'Step 2 of 3. Enter the 6-digit code we sent to your phone.',
        invalidOtp: 'That code is expired or incorrect. Please try again.',
        verifyCta: 'Verify code',
        verifying: 'Verifying…',
      },
      reset: {
        title: 'Create a new password',
        subtitle: 'Step 2 of 2. Enter your code and choose a new password.',
        otpLabel: 'Verification code',
        otpRequiredError: 'Enter the 6-digit code we sent you',
        newPasswordLabel: 'New password',
        passwordRules: 'Use at least 6 characters for your new password.',
        confirmPasswordLabel: 'Confirm new password',
        confirmPasswordRequiredError: 'Confirm your new password',
        passwordMismatchError: 'New passwords do not match',
        saveCta: 'Save new password',
        saving: 'Saving your new password…',
        savedToast: 'Password saved! Sign in to continue.',
        saveErrorToast: 'Could not save your new password. Please try again.',
        signinMessage: 'Password reset successfully. Sign in to continue.',
      },
    },
  },
  onboarding: {
    progressLabel: (step: number, total: number) => `Step ${step} of ${total}`,
    skip: 'Skip',
    town: {
      title: 'Where are you?',
      subtitle: 'Choose your city/town so we can show shops near you',
      wheelLabel: 'Your city/town',
      continueCta: 'Continue',
      finishCta: 'Finish',
      loadError: "Couldn't load cities. Retrying…",
    },
    name: {
      title: "What's your name?",
      subtitle: 'So we know what to call you',
      label: 'Full name',
      placeholder: 'e.g. Ama Mensah',
      continueCta: 'Continue',
    },
    phone: {
      title: 'Your phone number',
      subtitle: 'For delivery updates',
      label: 'Phone number',
      finishCta: 'Finish',
      invalidPhoneTitle: 'Check your number',
      invalidPhoneMessage: 'Please enter a valid phone number, or tap Skip.',
    },
    success: {
      title: 'Welcome to Tormame!',
    },
  },
  lobby: {
    headline: 'Food. Groceries.\nDelivered fast.',
    subtitle: 'Restaurants · Shops · Events · All in one app',
    changeLocation: 'Change location',
    addressHint: 'Tap to change your delivery location',
    signIn: 'Sign in',
    startBrowsing: 'Start browsing',
    /* Web-only. The web lobby is also the landing page, so it gets a real
       section heading and a partner link, which the native screen has no room
       for. */
    categoriesTitle: 'What are you shopping for?',
    categoriesSubtitle:
      'Restaurants, groceries, pharmacies and more. Tap a category to see what is open near you.',
    becomePartner: 'Become a partner',
    becomePartnerHint: 'Sell your food, groceries or goods on Tormame',
  },
  /* Web-only, all of it: the landing page needs a footer, and the mobile app
     has no equivalent surface. */
  footer: {
    tagline:
      'Food, groceries, pharmacy and more, delivered to your door.',
    getTheApp: 'Get the app',
    appStore: 'Download on the App Store',
    playStore: 'Get it on Google Play',
    /* Shown on a store badge whose listing URL is not configured yet: the app
       is announced, but the badge is inert rather than a link to nowhere. */
    comingSoon: 'Coming soon',
    appStoreSoon: 'TORMAME for iPhone, coming soon to the App Store',
    playStoreSoon: 'TORMAME for Android, coming soon to Google Play',
    company: 'Company',
    home: 'Browse stores',
    help: 'Help & support',
    partner: 'Become a partner',
    /* Required wording. Google permits hiding the reCAPTCHA badge only if this
       notice, with both links, is visible on the pages the check runs on. */
    recaptchaNotice: 'This site is protected by reCAPTCHA and the Google',
    recaptchaPrivacy: 'Privacy Policy',
    recaptchaAnd: 'and',
    recaptchaTerms: 'Terms of Service',
    recaptchaApply: 'apply.',
    trackOrder: 'Track an order',
    legal: 'Legal',
    terms: 'Terms & conditions',
    privacy: 'Privacy policy',
    cookies: 'Cookie policy',
    deleteAccount: 'Delete my account',
    followUs: 'Follow us',
    paymentsTitle: 'We accept',
    rights: (year: number) => `© ${year} Tormame. All rights reserved.`,
  },
  /* The public order-tracking page: reachable without an account, from the
     footer or from the link in the payment confirmation. */
  track: {
    title: 'Track your order',
    subtitle:
      'Enter the email or phone number you used, and the delivery code we sent you.',
    contactLabel: 'Email or phone number',
    contactPlaceholder: 'e.g. 0241234567',
    codeLabel: 'Delivery or pickup code',
    codePlaceholder: '6-digit code',
    submit: 'Find my order',
    searching: 'Looking for your order…',
    contactRequired: 'Enter the email or phone number you used to order',
    codeRequired: 'Enter the code we sent you',
    notFound:
      'We could not find an order with those details. Check them and try again. Only orders that have been paid for can be tracked.',
    throttled: 'Too many tries. Please wait a minute and try again.',
    linkOpening: 'Opening your order…',
    linkExpired:
      'That tracking link is no longer valid. Enter your details below to find your order.',
    startOver: 'Track another order',
    backToHome: 'Back to the home page',
    signedInHint: 'Signed in? Your orders are all in one place.',
    myOrders: 'Go to my orders',
    helpTitle: 'Where do I find my code?',
    helpBody:
      'It is the 6-digit delivery or pickup code in your order confirmation message.',
  },
  errors: {
    offlineTitle: "You're offline",
    offlineMessage: 'Check your internet connection, then try again.',
    serverTitle: 'Something went wrong',
    serverMessage: "It's not you. We're having a problem on our side. Please try again.",
    genericTitle: "That didn't work",
    genericMessage: 'Please try again.',
  },
  empty: {
    cart: { title: 'Your basket is empty', action: 'Browse stores' },
    orders: { title: "You haven't ordered anything yet", action: 'Browse stores' },
    search: { title: 'No results for that search', action: 'Try a different word' },
    addresses: { title: 'No saved addresses yet', action: 'Add an address' },
    storeProducts: { title: 'This store has nothing listed right now', action: 'Browse other stores' },
    homeStores: { title: 'No stores in your city/town yet', action: 'Browse stores' },
    categoryStores: (categoryName: string) => ({
      title: `No stores in ${categoryName} right now`,
      action: 'Show all stores',
    }),
  },
  home: {
    /* Web-only. A page needs one h1; the native screen has no such heading, and
       showing one here would break parity, so it is read out but not drawn. */
    pageHeading: 'Restaurants, shops and events near you',
    chooseAddress: 'Choose your delivery address',
    addressHint: 'Tap to change your delivery address',
    searchPlaceholder: 'Search restaurants, shops…',
    searchLabel: 'Search restaurants and shops',
    popularTitle: 'Popular near you',
    popularSubtitle: 'Top-rated stores near you',
    trendingTitle: 'Trending now',
    trendingSubtitle: "Everyone's ordering these",
    trendingPromoBadge: (percent: number) => `${percent}% off`,
    seeAll: 'See all',
    promoTitle: 'Fresh deals, delivered',
    promoSubtitle: 'Discover new restaurants and shops near you',
    promoCta: 'Explore deals',
    guestTitle: 'Sign in to order',
    guestSubtitle: 'Create an account or sign in to place orders and track deliveries.',
    signIn: 'Sign in',
    getStarted: 'Get started',
    popularBadge: 'Popular',
    railLoadErrorMessage: "Couldn't load this right now",
  },
  category: {
    /** Leading chip in the persistent home category rail — clears the active filter. */
    all: 'All',
    placesNearYou: (count: number) => `${count} place${count !== 1 ? 's' : ''} near you`,
  },
  collection: {
    emptyTitle: 'No stores to show here yet',
    loadMoreErrorMessage: "Couldn't load more stores",
  },
  explore: {
    title: 'Explore',
    searchPlaceholder: 'Search restaurants, items, events…',
    searchLabel: 'Search restaurants, items and events',
    categoriesTitle: 'Browse categories',
    trendingTitle: 'Trending searches',
    viewAllProducts: 'View all',
    viewAllProductsLabel: (storeName: string) => `View all products from ${storeName}`,
    trendingTags: [
      'Jollof Rice',
      'Pizza',
      'Burgers',
      'Groceries',
      'Fried Chicken',
      'Healthy',
      'Pastries',
      'Drinks',
      'Events',
    ],
  },
  shop: {
    searchToggleLabel: 'Search this shop',
    searchPlaceholder: (name: string) => `Search in ${name}…`,
    notFoundTitle: 'This shop is no longer available',
    unavailableLabel: 'Unavailable',
    priceFrom: (price: string) => `From ${price}`,
    clearBasketTitle: 'Clear your basket?',
    clearBasketMessage:
      'You already have items from another shop. Adding this will clear your basket.',
    clearBasketConfirm: 'Clear & add',
    categoryBarLabel: 'Menu categories',
  },
  product: {
    chooseOption: 'Choose your option',
    required: 'Required',
    maxSelect: (count: number) => `max ${count}`,
    allergensLabel: (list: string) => `Allergens: ${list}`,
    addToBasket: (total: string) => `Add to basket · ${total}`,
    decreaseQuantity: 'Decrease quantity',
    increaseQuantity: 'Increase quantity',
    quantityLabel: (count: number) => `Quantity: ${count}`,
    // Named after the first required group the shopper hasn't answered yet, e.g.
    // `chooseGroupFirst('Dough Type')` → "Choose Dough Type first"; the variant step
    // (no named group in the data model) passes a generic noun phrase instead.
    chooseGroupFirst: (groupName: string) => `Choose ${groupName} first`,
  },
  address: {
    sheetTitle: 'Delivery address',
    addNewAddress: 'Add new address',
    editTitle: 'Edit address',
    savedOnDevice: 'Saved on this device',
    streetLabel: 'Street*',
    streetPlaceholder: 'e.g. 12 Independence Ave',
    streetRequired: 'Street is required',
    townLabel: 'City/Town*',
    townPlaceholder: 'e.g. East Legon',
    townRequired: 'City/Town is required',
    chooseTown: 'Choose your city/town',
    landmarkLabel: 'Landmark',
    landmarkPlaceholder: 'e.g. Near Shell fuel station',
    postalCodeLabel: 'Postal code (optional)',
    postalCodePlaceholder: 'e.g. GA-123-4567',
    phoneLabel: 'Phone number (optional, if different)',
    phonePlaceholder: 'e.g. 0201234567',
    setDefaultLabel: 'Set as default address',
    saveAddress: 'Save address',
    saveChanges: 'Save changes',
    /* Checkout opens this same sheet as the last step before paying, so the
       button there says what actually happens next rather than "Save". */
    useAndPlaceOrder: 'Use this address and place order',
    chooseToPlaceOrderTitle: 'Where should we deliver?',
    chooseToPlaceOrderSubtitle: 'Pick an address to place your order, or add a new one.',
    missingDetailsTitle: 'Missing details',
    missingDetailsMessage: 'Please enter a street and city/town.',
    saveErrorTitle: 'Could not save address',
    saveErrorMessage: 'Please try again.',
    addressUpdatedToast: 'Address updated',
    addressAddedToast: 'Address added',
    updateErrorToast: 'Could not update address. Please try again.',
    createErrorToast: 'Could not save address. Please try again.',
  },
  branch: {
    sheetTitle: 'Choose a branch',
    selectLabel: (name: string) => `Choose ${name}`,
  },
  checkout: {
    title: 'Checkout',
    fulfillmentDelivery: 'Delivery',
    fulfillmentPickup: 'Pickup',
    changeAddress: 'Change',
    changeAddressLabel: 'Change delivery address',
    addAddress: 'Add delivery address',
    orderItemsTitle: 'Your order',
    removeItem: (name: string) => `Remove ${name} from your basket`,
    removedFromBasket: (name: string) => `Removed ${name} from your basket`,
    dropoffInstructionsTitle: 'Drop-off instructions',
    customNotePlaceholder: 'Add a note for the courier',
    costBreakdownTitle: 'Price breakdown',
    subtotal: 'Subtotal',
    serviceFee: 'Service fee',
    deliveryFee: 'Delivery fee',
    total: 'Total',
    placeOrder: (total: string) => `Place order · ${total}`,
    placingOrder: 'Placing your order…',
    missingAddressToast: 'Add a delivery address first',
    pickupFromTitle: 'Pick up from',
    fulfilledByTitle: 'Fulfilled by',
    changeBranch: 'Change',
    changeBranchLabel: 'Change the branch for this order',
    missingBranchToast: 'Choose which branch you want first',
    branchLoadFailed: "We couldn't load this shop's branches",
    retry: 'Try again',
    orderingFrom: 'Ordering from',
    signInToPlaceOrder: 'Sign in to place order',
    signInNotice:
      "You'll sign in before paying. Everything in your basket stays exactly as it is.",
  },
  payment: {
    headerTitle: 'Complete payment',
    /* Web-only. The native app hosts Paystack inside a WebView, so it never needs
       to describe a second tab; on web these two lines cover the wait and the
       blocked-popup case. */
    waitingMessage: 'Finish paying in the tab that just opened. This page updates by itself once payment goes through.',
    popupBlockedMessage: 'Your browser blocked the payment window. Tap the button below to open it.',
    openPaymentCta: 'Open payment',
    successTitle: 'Order placed!',
    successMessage: "We've got your payment. We'll let you know as your order moves along.",
    confirmationCodeLabel: 'Confirmation code:',
    viewOrder: 'View order',
    failureTitle: "Payment didn't go through",
    failureMessage: "We couldn't take payment for this order. Nothing was charged, so you can try again.",
    retryPayment: 'Try payment again',
    backToOrders: 'Back to orders',
  },
  /* Web-only. The Paystack return page, ported from quups_web's
     /payment-redirect route — same states and wording, rebuilt on this design
     system and able to hand off inside the website instead of only back to the
     native app. */
  paymentVerification: {
    documentTitle: 'Payment confirmation',
    invalidLinkTitle: 'Invalid payment link',
    invalidLinkMessage: 'This link is missing its payment reference, so there is nothing to confirm.',
    confirmingMessage: 'Confirming your payment. This can take a moment.',
    lookupErrorTitle: 'Something went wrong',
    lookupErrorMessage: 'We could not confirm this payment. Please contact support with your order reference if you completed payment.',
    failedTitle: 'Payment was not successful',
    orderReferenceLabel: (orderId: string) => `Order reference: ${orderId}`,
    slowTitle: 'Still confirming your payment',
    slowMessage: 'This is taking longer than usual.',
    refresh: 'Refresh',
    paidTitle: 'Payment received',
    subtotal: 'Subtotal',
    deliveryFee: 'Delivery fee',
    total: 'Total',
    orderIdLabel: (orderId: string) => `Order ID: ${orderId}`,
    viewOrder: 'View order',
    backHome: 'Back to home',
  },
  orders: {
    title: 'My Orders',
    tabActive: 'Active',
    tabPast: 'Past orders',
    tabCancelled: 'Cancelled',
    guestTitle: 'Sign in to see your orders',
    guestSubtitle: 'Sign in to start ordering from restaurants, shops and events near you.',
    getStarted: 'Get started free',
    signIn: 'Sign in',
    payNow: 'Pay now',
    verifyPayment: 'Verify payment',
    checkingPayment: 'Checking…',
    payActionLabel: (label: string) => `${label} for this order`,
    // Row label for the orders list. `payActionLabel` is only passed when the row has a
    // pay/verify action, so its accessibility hint (and the custom "pay" a11y action wired up
    // alongside this label) both stay silent for rows without one.
    rowLabel: (shopLabel: string, statusSentence: string, dateLabel: string, total: string, payActionLabel?: string) =>
      `${shopLabel}. ${statusSentence} ${dateLabel}. Total ${total}.${payActionLabel ? ` ${payActionLabel} available.` : ''}`,
    // Short label for the row's default "activate" accessibility action — VoiceOver's actions
    // rotor wants a brief action name here, not the full `rowLabel` sentence already announced.
    viewDetailsAction: 'View order details',
  },
  orderDetails: {
    fallbackShopName: 'Order',
    viewShopLabel: (name: string) => `View ${name}`,
    orderNumberLabel: (id: string) => `Order #${id.slice(0, 8).toUpperCase()}`,
    itemsTitle: 'Order items',
    deliveryAddressTitle: 'Delivery address',
    pickupAddressTitle: 'Pickup address',
    pickupAtTitle: 'Pick up at',
    deliveryCodeLabel: 'Delivery code',
    pickupCodeLabel: 'Pickup code',
    yourRatingTitle: 'Your rating',
    editRating: 'Edit rating',
    rateThisOrder: 'Rate this order',
    rateStarLabel: (n: number) => `Rate ${n} of 5`,
    commentLabel: 'Comment (optional)',
    commentPlaceholder: 'Tell us about your experience',
    submitRating: 'Submit rating',
    updateRating: 'Update rating',
    submittingRating: 'Submitting…',
    ratingSubmittedToast: 'Thanks for your rating!',
    ratingUpdatedToast: 'Rating updated',
    ratingErrorToast: 'Could not submit your rating. Please try again.',
  },
  profile: {
    menu: {
      guestHeroTitle: 'Welcome to TORMAME',
      guestHeroSubtitle: 'Sign in to order, track deliveries and manage your account.',
      signIn: 'Sign in',
      createAccount: 'Create account',
      discoverSectionTitle: 'Discover',
      browseStoresSubtitle: 'Restaurants, shops & events near you',
      myTown: 'My city/town',
      appSectionTitle: 'App',
      settings: 'Settings',
      helpCentre: 'Help centre',
      helpCentreSubtitle: 'FAQs and support articles',
      aboutApp: 'About TORMAME',
      versionLabel: (version: string) => `Version ${version}`,
      myAccountSectionTitle: 'My account',
      savedAddresses: 'Saved addresses',
      savedAddressesSubtitle: 'Home, work and more',
      personalInfo: 'Personal info',
      personalInfoSubtitle: 'Name, email, password',
      supportSectionTitle: 'Support',
      contactUs: 'Contact us',
      contactUsSubtitle: 'Chat, call or email support',
      editProfile: 'Edit',
      signOut: 'Sign out',
      signingOut: 'Signing out…',
      defaultUserName: 'User',
    },
    personalInfo: {
      profileDetailsTitle: 'Profile details',
      fullNameLabel: 'Full name',
      emailLabel: 'Email',
      phoneLabel: 'Phone',
      nameTooShort: 'Name is too short',
      saveChanges: 'Save changes',
      savingChanges: 'Saving…',
      profileUpdatedToast: 'Profile updated',
      profileUpdateErrorToast: 'Could not update profile. Please try again.',
      changePasswordTitle: 'Change password',
      currentPasswordLabel: 'Current password',
      newPasswordLabel: 'New password',
      confirmNewPasswordLabel: 'Confirm new password',
      currentPasswordRequired: 'Current password is required',
      passwordTooShort: 'Password must be at least 8 characters',
      passwordsMismatch: 'Passwords do not match',
      currentPasswordIncorrect: 'Current password is incorrect',
      changePasswordCta: 'Change password',
      changingPassword: 'Changing…',
      passwordChangedToast: 'Password changed',
      passwordChangeErrorToast: 'Could not change password. Please try again.',
    },
    addresses: {
      defaultBadge: 'Default',
      addCta: 'Add new address',
      editLabel: (street: string) => `Edit ${street}`,
      removeLabel: (street: string) => `Remove ${street}`,
      removeAction: 'Remove',
      deleteConfirmTitle: 'Remove this address?',
      deleteErrorToast: 'Could not remove address. Please try again.',
    },
    townSheet: {
      title: 'My city/town',
      subtitle: 'We use this to show shops near you',
    },
  },
  /* The partners landing page. The reader is a shop or restaurant owner who has
     never sold online before, so the page argues rather than describes: why
     bother, what it costs, what happens next. Kept short on purpose. The fee
     and the free allowance come from ENV, since the commercial model is not a
     code decision. */
  partners: {
    metaTitle: 'Sell on Tormame',
    metaDescription:
      'Take your restaurant or shop online in Ghana. No website to build, no monthly fee, and your first sales cost you nothing.',
    navBack: 'Back to Tormame',
    openPortal: 'Open the vendor portal',
    openPortalHint: 'Opens the vendor portal in a new tab',
    seePricing: 'See what it costs',

    headline: 'Your business, online and taking orders.',
    subhead:
      'Tormame gives your business a place to sell, customers to sell to, and payment that lands as soon as they buy. You do not need a website or anyone technical.',
    heroNote: (freeSales: number) =>
      `Your first ${freeSales} sales are free.`,

    whyTitle: 'Why sell here',
    why: [
      {
        title: 'Customers are already looking',
        body: 'People open Tormame to buy food, medicine and goods today. Being listed puts you in front of them without you spending on advertising.',
      },
      {
        title: 'No website, no computer',
        body: 'Your shop page is made for you. You add items from your phone, and change a price or mark something sold out in a couple of taps.',
      },
      {
        title: 'The money reaches you',
        body: 'Customers pay in the app by mobile money or card. Verified shops are paid as soon as the customer pays, and every sale is listed with its amount.',
      },
    ],

    sellTitle: 'What people sell on Tormame',

    partnersTitle: 'Businesses on Tormame',

    pricingTitle: 'What it costs',
    pricingFreeLabel: 'Your first sales',
    pricingFreeValue: (freeSales: number) => `${freeSales} sales free`,
    pricingFreeBody:
      'List your shop, add your items and start selling without paying anything.',
    pricingFeeLabel: 'After that',
    pricingFeeValue: (percent: number) => `${percent}% a sale`,
    pricingFeeBody:
      'A service fee on each sale you make. Nothing to pay in a month where you sell nothing.',
    pricingNote:
      'No monthly charge and no joining fee. You keep setting your own prices.',

    howTitle: 'How it works',
    steps: [
      {
        title: 'Apply with your shop details',
        body: 'Fill in your shop name and contact details on the vendor portal, and upload your documents.',
      },
      {
        title: 'We check and switch you on',
        body: 'Once your shop is approved you add what you sell, with your own prices, sizes and extras.',
      },
      {
        title: 'Sell and get paid',
        body: 'Customers order and pay in the app. Verified shops receive their money as soon as the customer pays.',
      },
    ],

    requirementsTitle: 'What you need to start',
    requirementsLead: 'Have these ready and the application takes a few minutes.',
    requirements: [
      'Your shop name and a phone number we can reach you on',
      'Your Ghana Card, front and back',
      'Your business registration certificate',
      'A mobile money or bank account for your payouts',
      'Photos and prices for what you sell',
    ],

    closingTitle: 'Start selling this week',
    closingBody: 'Apply today. Add your items once you are approved, and you are open.',
  },
  webview: {
    fallbackTitle: 'Web page',
  },
  settings: {
    title: 'Settings',
    appearanceTitle: 'Appearance',
    appearanceSubtitle: 'Choose how Tormame looks on this device',
    appearanceSystem: 'System',
    appearanceLight: 'Light',
    appearanceDark: 'Dark',
    legalSectionTitle: 'Legal',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    versionRowLabel: 'App version',
    accountSectionTitle: 'Your account',
    deleteAccountRow: 'Delete my account and data',
  },
  /* Account and data deletion. Required by the Apple and Google store policies,
     and promised in the privacy policy — so the copy states plainly what goes,
     what stays, and how long the customer has to change their mind. */
  deleteAccount: {
    title: 'Delete your account',
    intro:
      'You can ask us to delete your account and the personal information we hold about you.',
    whatHappensTitle: 'What we delete',
    whatHappens: [
      'Your name, email address and phone number',
      'Your saved delivery addresses',
      'Your saved devices and sign-in sessions',
    ],
    whatStaysTitle: 'What we have to keep',
    whatStays:
      'Records of orders you already placed stay with the shops that sold to you, because they are required to keep their sales records. Your name and contact details are removed from them.',
    graceTitle: 'You have 30 days to change your mind',
    graceBody:
      'Nothing is deleted straight away. Your account is scheduled for deletion in 30 days, and you can cancel any time before then by coming back to this page.',
    reasonLabel: 'Why are you leaving? (optional)',
    reasonPlaceholder: 'Tell us what went wrong, it helps us fix it',
    requestCta: 'Request account deletion',
    requesting: 'Sending your request…',
    confirmTitle: 'Delete your account?',
    confirmBody:
      'We will delete your account and personal information in 30 days. You can cancel any time before then.',
    confirmCta: 'Yes, delete my account',
    keepCta: 'No, keep my account',
    requestErrorToast: 'Could not send your request. Please try again.',
    pendingTitle: 'Your account is scheduled for deletion',
    pendingBody: (date: string) =>
      `We will delete your account and personal information on ${date}. Until then, everything still works as normal.`,
    pendingRequestedAt: (date: string) => `Requested on ${date}`,
    cancelCta: 'Keep my account',
    cancelling: 'Cancelling…',
    cancelledToast: 'Your account will not be deleted.',
    cancelErrorToast: 'Could not cancel. Please try again.',
    requestedToast: 'Your deletion request has been received.',
    signedOutTitle: 'Sign in to delete your account',
    signedOutBody:
      'We need to know which account to delete, so please sign in first.',
    helpNote:
      'Need help, or want your data removed sooner? Contact us and a person will handle it.',
  },
  help: {
    title: 'Help',
    contactTitle: 'Contact us',
    contactSubtitle: "Have a question or a problem with an order? We're happy to help.",
    emailRowLabel: 'Email us',
    faqTitle: 'Frequently asked questions',
    faq: [
      {
        question: 'How do I place an order?',
        answer:
          "Browse restaurants and shops near you, pick what you want, and add it to your basket. When you're ready, tap Checkout, confirm your delivery address and how you'll pay, then tap Place order.",
      },
      {
        question: 'How much does delivery cost?',
        answer:
          'The delivery fee depends on your address. You always see the subtotal, service fee, delivery fee and total on the checkout screen before you pay. There are no surprise charges.',
      },
      {
        question: 'How can I pay for my order?',
        answer:
          'You can pay with mobile money or a debit/credit card. All payments are processed securely through Paystack.',
      },
      {
        question: "What if there's a problem with my order?",
        answer:
          "Contact us using the details above and we'll help sort it out. If a payment didn't go through, open the order from Orders and tap Try payment again.",
      },
      {
        question: 'How do I change my delivery address?',
        answer:
          'Go to Profile, then Saved addresses, to add, edit or remove an address. You can also pick a different saved address, or add a new one, while checking out.',
      },
    ],
  },
} as const;
