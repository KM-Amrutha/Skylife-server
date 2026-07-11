# Skylife Aircraft Booking System — Complete Project Documentation

## 1. What is Skylife?

Skylife is a full-stack aircraft ticket booking platform with three user roles: **User**, **Provider** (airline), and **Admin**. Users search and book flights, providers manage aircraft and flight schedules, and admins oversee the entire platform including approvals, commissions, and wallet management.Architecture
Clean Architecture — 4 layers:
strictly follows solid principles
 Presentation → Application → Domain → Infrastructure 

## Layer responsibilities:
```
Domain:           Entities + Repository Interfaces
Application:      UseCases + DTOs + Mappers + Service & Usecase Interfaces  
Infrastructure:   Repos + Models + Services + Config + Jobs
Presentation:     Controllers + Routes + Middlewares
```
## 2. Tech Stack

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **API Style:** RESTful API
- **Type safety across all layers:** TypeScript
- **Dependency Injection:** InversifyJS
- **Primary Database:** MongoDB +Mongoose
- **Session caching, OTP sessions, seat locks:** Redis (ioredis)
- **Dependency Injection:** InversifyJS
- **Payment processing:** Stripe
- **Image and file storage:** Cloudinary +AWS S3 Bucket
- **Authentication:** JWT (access/refresh tokens)
- **OAuth:** Google OAuth 2.0 (Google Identity Services)
- **Password Hashing:** bcrypt
- **Email Delivery:** Nodemailer
- **Http Request logging:** Morgan

## Folder Structure
```
back-end/
├── data/
├── logs/
├── node_modules/
├── src/
│   ├── server.ts
│   ├── application/
│   │   ├── dtos/
│   │   │   ├── service/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── cloud.storage.service.ts
│   │   │   │   ├── date.service.ts
│   │   │   │   ├── email.service.ts
│   │   │   │   └── stripe.service.ts
│   │   │   ├── aircraft-dtos.ts
│   │   │   ├── auth-dtos.ts
│   │   │   ├── booking-dtos.ts
│   │   │   ├── destination-dtos.ts
│   │   │   ├── flight-dtos.ts
│   │   │   ├── flightSeat-dtos.ts
│   │   │   ├── food-dtos.ts
│   │   │   ├── logger-dtos.ts
│   │   │   ├── offer-dtos.ts
│   │   │   ├── provider-dtos.ts
│   │   │   ├── query-dtos.ts
│   │   │   ├── seat-dtos.ts
│   │   │   ├── ticket-dtos.ts
│   │   │   ├── user-dtos.ts
│   │   │   ├── utility-dtos.ts
│   │   │   └── wallet-dtos.ts
│   │   ├── interfaces/
│   │   │   ├── service/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── IAuth.service.ts
│   │   │   │   │   └── IGoogle.auth.service.ts
│   │   │   │   ├── booking/
│   │   │   │   │   └── IBookingConfirmation.service.ts
│   │   │   │   ├── cache/
│   │   │   │   │   └── IRedis.service.ts
│   │   │   │   ├── communication/
│   │   │   │   │   └── IEmail.service.ts
│   │   │   │   ├── logging/
│   │   │   │   │   └── ILogger.service.ts
│   │   │   │   ├── payment/
│   │   │   │   │   ├── IProviderWallet.service.ts
│   │   │   │   │   ├── IStripe.service.ts
│   │   │   │   │   ├── ITicketGeneration.service.ts
│   │   │   │   │   └── IUserWalletCredit.service.ts
│   │   │   │   ├── security/
│   │   │   │   │   ├── IEncryption.service.ts
│   │   │   │   │   ├── IGenerate-otp.service.ts
│   │   │   │   │   └── IHash.service.ts
│   │   │   │   └── storage/
│   │   │   │       └── ICloud.storage.service.ts
│   │   │   └── usecase/
│   │   │       ├── admin/
│   │   │       │   ├── IGet-adminWalletUsecase.ts
│   │   │       │   ├── IGetAdminDashboard.usecase.ts
│   │   │       │   ├── IGetAllProviders.usecase.ts
│   │   │       │   ├── IGetAllUsers.usecase.ts
│   │   │       │   ├── IGetPendingProvider.usecase.ts
│   │   │       │   ├── IRejectedProvider.usecase.ts
│   │   │       │   ├── ISet-providerCommisionUsecase.ts
│   │   │       │   ├── IUpdate-providerStatus.usecase.ts
│   │   │       │   ├── IUpdate-userStatus.usecase.ts
│   │   │       │   └── IVerifyProvider.usecase.ts
│   │   │       ├── aircraft/
│   │   │       │   ├── ICreate-aircraftUsecase.ts
│   │   │       │   ├── ICreate-seatLayoutUsecase.ts
│   │   │       │   ├── IDelete-aircraftUsecase.ts
│   │   │       │   ├── IDelete-seatLayoutUsecase.ts
│   │   │       │   ├── IGenerate-seatsUsecase.ts
│   │   │       │   ├── IGet-AricraftSeatsUsecase.ts
│   │   │       │   ├── IGetAll-seatTypesUsecase.ts
│   │   │       │   ├── IGetProvider-aircraftUsecase.ts
│   │   │       │   ├── IGetSeatLayoutByAircraft-usecase.ts
│   │   │       │   ├── ISearch-destinationUsecase.ts
│   │   │       │   ├── IToggle-seatBlockUsecase.ts
│   │   │       │   ├── IUpdate-aircraftUsecase.ts
│   │   │       │   ├── IUpdateLocation-aircraftUsecase.ts
│   │   │       │   └── IUpdateStatus-aircraftUsecase.ts
│   │   │       ├── auth/
│   │   │       │   ├── IChange-password.usecase.ts
│   │   │       │   ├── ICheck-userBlockStatus.usecase.ts
│   │   │       │   ├── ICreate-provider.usecase.ts
│   │   │       │   ├── ICreate-user.usecase.ts
│   │   │       │   ├── IForgot-password.usecase.ts
│   │   │       │   ├── IOtp.usecase.ts
│   │   │       │   ├── ISend-passwordLink.usecase.ts
│   │   │       │   ├── ISignin-user.usecase.ts
│   │   │       │   └── IToken.usecase.ts
│   │   │       ├── booking/
│   │   │       │   ├── IAddFlight-toSegmentUsecase.ts
│   │   │       │   ├── IBooking-detailsUsecase.ts
│   │   │       │   ├── ICancel-passengerUsecase.ts
│   │   │       │   ├── IGet-adminBookingsUsecase.ts
│   │   │       │   ├── IGet-bookingByIdUsecase.ts
│   │   │       │   ├── IGet-bookingsSummaryUsecase.ts
│   │   │       │   ├── IGet-ProviderBookingByIdUsecase.ts
│   │   │       │   ├── IGet-providerBookingsUsecase.ts
│   │   │       │   ├── IGet-ticketUsecase.ts
│   │   │       │   ├── IGet-userBookingsUsecase.ts
│   │   │       │   ├── IGetBooking-seatMapUsecase.ts
│   │   │       │   ├── IGetBooking-segmentUsecase.ts
│   │   │       │   ├── IHandle-webhookUsecase.ts
│   │   │       │   ├── IInitiate-bookingUsecase.ts
│   │   │       │   ├── IRetry-payment.usecase.ts
│   │   │       │   ├── ISeat-lockUsecase.ts
│   │   │       │   └── IUpdateBooking-segmentUsecase.ts
│   │   │       ├── flight/
│   │   │       │   ├── IApprove-flightUsecase.ts
│   │   │       │   ├── IAvailableAircraftsForSchedule-Usecase.ts
│   │   │       │   ├── ICreate-flightUsecase.ts
│   │   │       │   ├── ICreate-recurringFlightUsecase.ts
│   │   │       │   ├── IDelete-flightUsecase.ts
│   │   │       │   ├── IGetAll-flightsForAdminUsecase.ts
│   │   │       │   ├── IGetFlight-byIdUsecase.ts
│   │   │       │   ├── IGetFlight-seatUsecase.ts
│   │   │       │   ├── IGetProvider-flightUsecase.ts
│   │   │       │   ├── IPending-flightForApprovalUsecase.ts
│   │   │       │   ├── IReject-singleFlightUsecase.ts
│   │   │       │   ├── ISearch-flightUsecase.ts
│   │   │       │   └── IUpdate-flightUsecase.ts
│   │   │       ├── food/
│   │   │       │   ├── ICreate-foodUsecase.ts
│   │   │       │   ├── IDelete-foodUsecase.ts
│   │   │       │   ├── IFoodStatus-changeUsecase.ts
│   │   │       │   ├── IGetFood-ByAircraftUsecase.ts
│   │   │       │   ├── IGetFood-byProviderUsecase.ts
│   │   │       │   └── IUpdate-foodUsecase.ts
│   │   │       ├── offer/
│   │   │       │   ├── ICreate-offerUsecase.ts
│   │   │       │   ├── IDelete-offerUsecase.ts
│   │   │       │   ├── IGet-eligibleOfferUsecase.ts
│   │   │       │   ├── IGetProvider-offersUsecase.ts
│   │   │       │   ├── IOffer-statusChangeUsecase.ts
│   │   │       │   └── IUpdate-offerUsecase.ts
│   │   │       ├── provider/
│   │   │       │   ├── ICompleteProvider-profile.usecase.ts
│   │   │       │   └── IGetProviderProfile.usecase.ts
│   │   │       ├── user/
│   │   │       │   ├── IGetUserProfile.usecase.ts
│   │   │       │   └── IUpdateUserProfile.usecase.ts
│   │   │       └── wallet/
│   │   │           ├── IAdd-moneyToProviderWalletUsecase.ts
│   │   │           ├── IAdd-moneyToWalletUsecase.ts
│   │   │           ├── IGet-providerWalletUsecase.ts
│   │   │           ├── IGet-userWalletUsecase.ts
│   │   │           ├── IPay-withWalletUsecase.ts
│   │   │           └── ILogger-usecase.ts
│   │   ├── mappers/
│   │   │   ├── adminMapper.ts
│   │   │   ├── adminWalletMapper.ts
│   │   │   ├── aircraftMapper.ts
│   │   │   ├── bookingCacheMapper.ts
│   │   │   ├── bookingMapper.ts
│   │   │   ├── destinationMapper.ts
│   │   │   ├── flightMapper.ts
│   │   │   ├── flightSeatMapper.ts
│   │   │   ├── foodMapper.ts
│   │   │   ├── offerMapper.ts
│   │   │   ├── providerMapper.ts
│   │   │   ├── providerWalletMapper.ts
│   │   │   ├── seatMapper.ts
│   │   │   ├── ticketMapper.ts
│   │   │   ├── userMapper.ts
│   │   │   └── userWalletMapper.ts
│   │   └── usecases/
│   │       ├── admin/
│   │       │   ├── get-adminDashboard.usecase.ts
│   │       │   ├── get-adminWallet.usecase.ts
│   │       │   ├── get-pending-provider.usecase.ts
│   │       │   ├── getAll-provider.usecase.ts
│   │       │   ├── getAll-users.usecase.ts
│   │       │   ├── reject-provider.usecase.ts
│   │       │   ├── set-providerCommision.usecase.ts
│   │       │   ├── update-providerStatus.usecase.ts
│   │       │   ├── update-usersStatus.usecase.ts
│   │       │   └── verify-provider.usecase.ts
│   │       ├── aircraft/
│   │       │   ├── create-aircraft.usecase.ts
│   │       │   ├── create-seatLayout.usecase.ts
│   │       │   ├── delete-aircraft.usecase.ts
│   │       │   ├── delete-seatLayout.usecase.ts
│   │       │   ├── generate-seats.usecase.ts
│   │       │   ├── get-aircraftSeats.usecase.ts
│   │       │   ├── getall-seatTypes.usecase.ts
│   │       │   ├── getProvider-aircraft.usecase.ts
│   │       │   ├── getSeatLayoutByAircraft.usecase.ts
│   │       │   ├── search-destination.usecase.ts
│   │       │   ├── toggle-seatBlock.usecase.ts
│   │       │   ├── update-aircraft.usecase.ts
│   │       │   ├── updateLocation-aircraft.usecase.ts
│   │       │   └── updateStatus-aircraft.usecase.ts
│   │       ├── auth/
│   │       │   ├── change-password.usecase.ts
│   │       │   ├── check-user-blockstatus.usecase.ts
│   │       │   ├── create-provider.usecase.ts
│   │       │   ├── create-user.usecases.ts
│   │       │   ├── forgot-password.usecase.ts
│   │       │   ├── google-auth.usecase.ts
│   │       │   ├── otp.usecase.ts
│   │       │   ├── send-password-reset-link.usecase.ts
│   │       │   ├── signin-user.usecases.ts
│   │       │   └── token.usecase.ts
│   │       ├── booking/
│   │       │   ├── addFlight-toSegment.usecase.ts
│   │       │   ├── booking-details.usecase.ts
│   │       │   ├── cancel-passenger.usecase.ts
│   │       │   ├── get-adminBookings.usecase.ts
│   │       │   ├── get-bookingById.usecase.ts
│   │       │   ├── get-providerBookingById.usecase.ts
│   │       │   ├── get-providerBookings.usecase.ts
│   │       │   ├── get-ticket.usecase.ts
│   │       │   ├── get-userBookings.usecase.ts
│   │       │   ├── getBooking-seatsMap.usecase.ts
│   │       │   ├── getBooking-segment.usecase.ts
│   │       │   ├── getBooking-summary.usecase.ts
│   │       │   ├── handle-webhook.usecase.ts
│   │       │   ├── initiate-booking.usecase.ts
│   │       │   ├── retry-payment.usecase.ts
│   │       │   ├── seat-lock.usecase.ts
│   │       │   └── updateBooking-segment.usecase.ts
│   │       ├── flight/
│   │       │   ├── approve-flight.usecase.ts
│   │       │   ├── availableAircraftForSchedule.usecase.ts
│   │       │   ├── create-flight.usecase.ts
│   │       │   ├── create-recurringFlight.usecase.ts
│   │       │   ├── delete-flight.usecase.ts
│   │       │   ├── get-flightById.usecase.ts
│   │       │   ├── getall-flightsForAdmin.usecase.ts
│   │       │   ├── getFlightSeat.usecase.ts
│   │       │   ├── getProvider-flight.usecase.ts
│   │       │   ├── pendingFlightsForApproval.usecase.ts
│   │       │   ├── reject-singleFlight.usecase.ts
│   │       │   ├── search-flight.usecase.ts
│   │       │   └── update-flight.usecase.ts
│   │       ├── food/
│   │       │   ├── create-food.usecase.ts
│   │       │   ├── delete-food.usecase.ts
│   │       │   ├── foodStatus-change.usecase.ts
│   │       │   ├── getFoods-byAircraft.usecase.ts
│   │       │   ├── getFoods-byProvider.usecase.ts
│   │       │   └── update-food.usecase.ts
│   │       ├── offer/
│   │       │   ├── create-offer.usecase.ts
│   │       │   ├── delete-offer.usecase.ts
│   │       │   ├── get-eligibleOffers.usecase.ts
│   │       │   ├── getProvider-offers.usecase.ts
│   │       │   ├── offerStatus-change.usecase.ts
│   │       │   └── update-offer.usecase.ts
│   │       ├── provider/
│   │       │   ├── completeProviderProfile.usecase.ts
│   │       │   └── getProviderProfile.usecase.ts
│   │       ├── user/
│   │       │   ├── getUserProfile.usecase.ts
│   │       │   └── UpdateUserProfile.usecase.ts
│   │       └── wallet/
│   │           ├── add-moneyToProviderWallet.usecase.ts
│   │           ├── add-moneyToWallet.usecase.ts
│   │           ├── get-providerWallet.usecase.ts
│   │           ├── get-userWallet.usecase.ts
│   │           ├── pay-withWallet.usecase.ts
│   │           └── handle-log-usecase.ts
│   ├── config/
│   ├── di/
│   │   ├── container-resolver.ts
│   │   ├── container.ts
│   │   ├── file-imports.ts
│   │   ├── types-controllers.ts
│   │   ├── types-repository.ts
│   │   ├── types-services.ts
│   │   └── types-usecases.ts
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── admin.entity.ts
│   │   │   ├── adminWallet.entity.ts
│   │   │   ├── aircraft.entity.ts
│   │   │   ├── bookinDetails.entity.ts
│   │   │   ├── booking.entity.ts
│   │   │   ├── bookinSegment.entity.ts
│   │   │   ├── destination.entity.ts
│   │   │   ├── flight.entity.ts
│   │   │   ├── flightSeat.entity.ts
│   │   │   ├── food.entity.ts
│   │   │   ├── notification.entity.ts
│   │   │   ├── notificationTemplate.entity.ts
│   │   │   ├── offer.entity.ts
│   │   │   ├── pass-reset-token.entity.ts
│   │   │   ├── passenger.entity.ts
│   │   │   ├── payment.entity.ts
│   │   │   ├── provider.entity.ts
│   │   │   ├── providerWallet.entity.ts
│   │   │   ├── seat.entity.ts
│   │   │   ├── seatLayout.entity.ts
│   │   │   ├── seatType.entity.ts
│   │   │   ├── ticket.entity.ts
│   │   │   ├── user.entity.ts
│   │   │   └── userWallet.entity.ts
│   │   └── interfaces/
│   │       ├── IAdminWalletRepository.ts
│   │       ├── IAircraftRepository.ts
│   │       ├── IBaseRepository.ts
│   │       ├── IBookingRepository.ts
│   │       ├── IDestinationRepository.ts
│   │       ├── IFlightRepository.ts
│   │       ├── IFlightSeatRepository.ts
│   │       ├── IFoodRepository.ts
│   │       ├── IOfferRepository.ts
│   │       ├── IPasswordResetTokenRepository.ts
│   │       ├── IProviderRepository.ts
│   │       ├── IProviderWalletRepository.ts
│   │       ├── ISeatLayoutRepository.ts
│   │       ├── ISeatRepository.ts
│   │       ├── ISeatTypeRepository.ts
│   │       ├── ITicketRepository.ts
│   │       ├── IUserRepository.ts
│   │       └── IUserWalletRepository.ts
│   ├── infrastructure/
│   │   ├── config/
│   │   │   ├── cloudinary.config.ts
│   │   │   ├── db.config.ts
│   │   │   ├── logger.config.ts
│   │   │   ├── redis.config.ts
│   │   │   ├── s3.config.ts
│   │   │   └── stripe.config.ts
│   │   ├── databases/
│   │   │   ├── models/
│   │   │   │   ├── adminWallet.model.ts
│   │   │   │   ├── aircraft.model.ts
│   │   │   │   ├── airportFacility.model.ts
│   │   │   │   ├── booking.model.ts
│   │   │   │   ├── destination.model.ts
│   │   │   │   ├── flight.model.ts
│   │   │   │   ├── flightSeat.model.ts
│   │   │   │   ├── food.model.ts
│   │   │   │   ├── notification.model.ts
│   │   │   │   ├── notificationTemplate.model.ts
│   │   │   │   ├── offer.model.ts
│   │   │   │   ├── passenger.model.ts
│   │   │   │   ├── password.token.model.ts
│   │   │   │   ├── payment.model.ts
│   │   │   │   ├── provider.model.ts
│   │   │   │   ├── providerWallet.model.ts
│   │   │   │   ├── revenue.model.ts
│   │   │   │   ├── seat.model.ts
│   │   │   │   ├── seatLayout.model.ts
│   │   │   │   ├── seatType.model.ts
│   │   │   │   ├── ticket.model.ts
│   │   │   │   ├── user.model.ts
│   │   │   │   └── userWallet.model.ts
│   │   │   └── repositories/
│   │   │       ├── adminWallet.repository.ts
│   │   │       ├── aircraft.repository.ts
│   │   │       ├── base.repository.ts
│   │   │       ├── booking.repository.ts
│   │   │       ├── destination.repository.ts
│   │   │       ├── flight.repository.ts
│   │   │       ├── flightSeat.repository.ts
│   │   │       ├── food.repository.ts
│   │   │       ├── offer.repository.ts
│   │   │       ├── passwordResetToken.repository.ts
│   │   │       ├── provider.repository.ts
│   │   │       ├── providerWalletRepository.ts
│   │   │       ├── seat.repository.ts
│   │   │       ├── seatLayout.repository.ts
│   │   │       ├── seatType.repository.ts
│   │   │       ├── ticket.repository.ts
│   │   │       ├── user.repository.ts
│   │   │       └── userWallet.repository.ts
│   │   ├── seeders/
│   │   │   └── index.ts
│   │   └── services/
│   │       ├── auth/
│   │       │   ├── google.auth.service.ts
│   │       │   └── jwt.service.ts
│   │       ├── booking/
│   │       │   └── bookingConfirmation.service.ts
│   │       ├── cache/
│   │       │   └── redis.service.ts
│   │       ├── communication/
│   │       │   └── email.service.ts
│   │       ├── logging/
│   │       │   ├── logger.services.ts
│   │       │   └── morgan.services.ts
│   │       ├── payment/
│   │       │   ├── providerWallet.service.ts
│   │       │   ├── stripe.service.ts
│   │       │   ├── ticketGeneration.service.ts
│   │       │   └── userWalletCredit.service.ts
│   │       ├── security/
│   │       │   ├── encryption.services.ts
│   │       │   ├── hash.services.ts
│   │       │   └── otp.services.ts
│   │       └── storage/
│   │           ├── cloudinary.services.ts
│   │           └── s3storage.services.ts
│   ├── presentation/
│   │   ├── controllers/
│   │   │   ├── admin/
│   │   │   │   ├── get-adminDashboard.controller.ts
│   │   │   │   ├── get-adminWallet.controller.ts
│   │   │   │   ├── get-allProvider.controller.ts
│   │   │   │   ├── get-allUsers.controller.ts
│   │   │   │   ├── provider-verification.controller.ts
│   │   │   │   ├── set-providerCommission.controller.ts
│   │   │   │   ├── update-providerStatus.controller.ts
│   │   │   │   └── update-userStatus.controller.ts
│   │   │   ├── auth/
│   │   │   │   ├── change-password.controller.ts
│   │   │   │   ├── forget-password.controller.ts
│   │   │   │   ├── generate-password-link.controller.ts
│   │   │   │   ├── google-auth.controller.ts
│   │   │   │   ├── otp.controller.ts
│   │   │   │   ├── refresh-access-token.controller.ts
│   │   │   │   ├── sign-in.controller.ts
│   │   │   │   ├── sign-out.controller.ts
│   │   │   │   ├── sign-up-provider.controller.ts
│   │   │   │   └── sign-up-user.controller.ts
│   │   │   ├── booking/
│   │   │   │   ├── addFlightToSegment.controller.ts
│   │   │   │   ├── bookingDetails.controller.ts
│   │   │   │   ├── cancelPassenger.controller.ts
│   │   │   │   ├── getAdminBookings.controller.ts
│   │   │   │   ├── getBookingById.controller.ts
│   │   │   │   ├── getBookingSeatsMap.controller.ts
│   │   │   │   ├── getBookingSegment.controller.ts
│   │   │   │   ├── getBookingSummary.controller.ts
│   │   │   │   ├── getProviderBookingById.controller.ts
│   │   │   │   ├── getProviderBookings.controller.ts
│   │   │   │   ├── getTicket.controller.ts
│   │   │   │   ├── getUserBookings.controller.ts
│   │   │   │   ├── handleWebhook.controller.ts
│   │   │   │   ├── initiateBooking.controller.ts
│   │   │   │   ├── retryPayment.controller.ts
│   │   │   │   ├── seatLock.controller.ts
│   │   │   │   └── updateBookingSegment.controller.ts
│   │   │   ├── flight/
│   │   │   │   ├── approveFlights.controller.ts
│   │   │   │   ├── availableAircraftsForSchedule.controller.ts
│   │   │   │   ├── createFlight.controller.ts
│   │   │   │   ├── createRecurringFlight.controller.ts
│   │   │   │   ├── deleteFlight.controller.ts
│   │   │   │   ├── getAllFlightsForAdmin.controller.ts
│   │   │   │   ├── getFlightById.controller.ts
│   │   │   │   ├── getFlightSeat.controller.ts
│   │   │   │   ├── getFlightSeatUser.controller.ts
│   │   │   │   ├── getProviderFlights.controller.ts
│   │   │   │   ├── pendingFlightsForApproval.controller.ts
│   │   │   │   ├── rejectSingleFlight.controller.ts
│   │   │   │   ├── searchFlights.controller.ts
│   │   │   │   └── updateFlight.controller.ts
│   │   │   ├── food/
│   │   │   │   ├── createFood.controller.ts
│   │   │   │   ├── deleteFood.controller.ts
│   │   │   │   ├── foodStatusChange.controller.ts
│   │   │   │   ├── getFoodsByAricraft.controller.ts
│   │   │   │   ├── getFoodsByProvider.controller.ts
│   │   │   │   └── updateFood.controller.ts
│   │   │   ├── offer/
│   │   │   │   ├── createOffer.controller.ts
│   │   │   │   ├── deleteOffer.controller.ts
│   │   │   │   ├── getEligibleOffers.controller.ts
│   │   │   │   ├── getProviderOffers.controller.ts
│   │   │   │   ├── offersStatusChange.controller.ts
│   │   │   │   └── updateOffer.controller.ts
│   │   │   ├── provider/
│   │   │   │   ├── completeProviderProfile.controller.ts
│   │   │   │   ├── createAircraft.controller.ts
│   │   │   │   ├── createSeatLayout.controller.ts
│   │   │   │   ├── deleteAircraft.controller.ts
│   │   │   │   ├── deleteSeatLayout.controller.ts
│   │   │   │   ├── generateSeats.controller.ts
│   │   │   │   ├── getAircraftSeats.controller.ts
│   │   │   │   ├── getAllSeatTypes.controller.ts
│   │   │   │   ├── getProviderAircraft.controller.ts
│   │   │   │   ├── getProviderProfile.controller.ts
│   │   │   │   ├── getSeatLayout.controller.ts
│   │   │   │   ├── searchDestinations.controller.ts
│   │   │   │   ├── toggleSeatBlock.controller.ts
│   │   │   │   └── updateAircraft.controller.ts
│   │   │   ├── user/
│   │   │   │   ├── getUserProfile.controller.ts
│   │   │   │   └── updateUserProfile.controller.ts
│   │   │   └── wallet/
│   │   │       ├── addMoneyToProviderWallet.controller.ts
│   │   │       ├── addMoneyToWallet.controller.ts
│   │   │       ├── getProviderWallet.controller.ts
│   │   │       ├── getUserWallet.controller.ts
│   │   │       └── payWithWallet.controller.ts
│   │   ├── middlewares/
│   │   │   ├── admin.middleware.ts
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── notfound.middleware.ts
│   │   │   └── ratelimit.middleware.ts
│   │   └── routes/
│   │       ├── admin.route.ts
│   │       ├── auth.route.ts
│   │       ├── provider.route.ts
│   │       └── user.route.ts
│   ├── scripts/
│   │   ├── seed-airports.ts
│   │   └── seed-seattypes.ts
│   ├── shared/
│   │   ├── constants/
│   │   │   ├── aircraftMessages/
│   │   │   ├── authMessages/
│   │   │   │   ├── auth.messages.ts
│   │   │   │   ├── block.messages.ts
│   │   │   │   ├── jwt.messages.ts
│   │   │   │   ├── otp.messages.ts
│   │   │   │   ├── password.messages.ts
│   │   │   │   └── profile.messages.ts
│   │   │   ├── bookingmessages/
│   │   │   ├── commonmessages/
│   │   │   ├── flightmessages/
│   │   │   ├── foodmessages/
│   │   │   ├── http.statuscodes.ts
│   │   │   ├── index.constant.ts
│   │   │   ├── offermessages/
│   │   │   ├── providermessages/
│   │   │   ├── seatmessages/
│   │   │   ├── ticketmessages/
│   │   │   ├── usermessages/
│   │   │   └── walletmessages/
│   │   └── utils/
│   │       ├── amenities.constant.ts
│   │       ├── async-handler.ts
│   │       ├── booking-cleanup.ts
│   │       ├── cookies.ts
│   │       ├── http.response.ts
│   │       ├── pagination.ts
│   │       └── parse-queryParams.ts
│   └── types/
│       └── express/
│           └── index.d.ts
├── .env
├── .gitignore
├── eslint.config.mjs
├── package-lock.json
├── package.json
├── README.MD
├── tsconfig.json
```
## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables
```
# Server Configuration
PORT= 

# Database Configurations
COMPASS_DATABASE_CONFIG=
ATLAS_DATABASE_CONFIG=

# CORS front-end Origins
CLIENT_ORIGINS=

# JWT Configuration
JWT_SECRET= 
JWT_EXPIRATION= 10m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRATION= 

# Node Environment (Development or Production)
NODE_ENV= "developement"

# Email Configuration
EMAIL_USER=
EMAIL_PASS=


# Cloudinary Configuration for Media Uploads
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

#s3 bucket configuration for food uplaod
AWS_REGION=
AWS_ACCESS_KEY=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=

#google api key
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
 

 #Redis Configuration for Caching
REDIS_HOST=
REDIS_PORT=

#stripe configuration
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

```
