import "reflect-metadata";
import "./load-environment";
import { App } from "./app";
import {
	container,
	Lifecycle,
	logWriters,
	Logger,
	eventBusProviders,
	EventbusService,
	PolicyService,
	AuthService,
} from "@structured-growth/microservice-sdk";
import { loadEnvironment } from "./load-environment";
import { CredentialsService } from "../modules/credentials/credentials.service";
import { OauthClientPoliciesService } from "../modules/oauth-client-policies/oauth-client-policies.service";
import { CredentialsRepository } from "../modules/credentials/credentials.repository";
import { OauthClientsRepository } from "../modules/oauth-clients/oauth-clients.repository";
import { OauthClientPoliciesRepository } from "../modules/oauth-client-policies/oauth-client-policies.repository";
import { PermittedOrganizationsRepository } from "../modules/permitted-organizations/permitted-organizations.repository";
import { PermittedOrganizationsService } from "../modules/permitted-organizations/permitted-organizations.service";
import { OTPsRepository } from "../modules/otps/otps.repository";
import { OTPsService } from "../modules/otps/otps.service";

// load and validate env variables
loadEnvironment();

// const
container.register("appPrefix", { useValue: process.env.APP_PREFIX });
container.register("stage", { useValue: process.env.STAGE });
container.register("region", { useValue: process.env.REGION });
container.register("isDev", { useValue: process.env.STAGE === "dev" });
container.register("isTest", { useValue: process.env.STAGE === "test" });
container.register("logDbRequests", { useValue: process.env.LOG_DB_REQUESTS === "true" });
container.register("logRequestBody", { useValue: process.env.LOG_HTTP_REQUEST_BODY === "true" });
container.register("logResponses", { useValue: process.env.LOG_HTTP_RESPONSES === "true" });
container.register("encryptionKey", { useValue: process.env.ENCRYPTION_KEY });

// services
container.register("LogWriter", logWriters[process.env.LOG_WRITER] || "ConsoleLogWriter", {
	lifecycle: Lifecycle.Singleton,
});
container.register("Logger", Logger);
container.register("App", App, { lifecycle: Lifecycle.Singleton });
container.register("CredentialsService", CredentialsService);
container.register("PermittedOrganizationsService", PermittedOrganizationsService);
container.register("OauthClientPoliciesService", OauthClientPoliciesService);

container.register("eventbusName", { useValue: process.env.EVENTBUS_NAME || "sg-eventbus-dev" });
container.register("EventbusProvider", eventBusProviders[process.env.EVENTBUS_PROVIDER || "TestEventbusProvider"]);
container.register("EventbusService", EventbusService);

container.register("authenticationEnabled", { useValue: process.env.AUTHENTICATION_ENABLED === "true" });
container.register("authorizationEnabled", { useValue: process.env.AUTHORIZATION_ENABLED === "true" });
container.register("internalAuthenticationEnabled", {
	useValue: process.env.INTERNAL_AUTHENTICATION_ENABLED === "true",
});
container.register("internalRequestsAllowed", { useValue: process.env.INTERNAL_REQUESTS_ALLOWED === "true" });
container.register("internalAuthenticationJwtSecret", { useValue: process.env.INTERNAL_AUTHENTICATION_JWT_SECRET });
container.register("oAuthServiceGetUserUrl", { useValue: process.env.OAUTH_USER_URL });
container.register("policiesServiceUrl", { useValue: process.env.POLICY_SERVICE_URL });
container.register("AuthService", AuthService);
container.register("PolicyService", PolicyService);
container.register("OTPsService", OTPsService);

// repositories
container.register("CredentialsRepository", CredentialsRepository);
container.register("OauthClientsRepository", OauthClientsRepository);
container.register("OauthClientPoliciesRepository", OauthClientPoliciesRepository);
container.register("PermittedOrganizationsRepository", PermittedOrganizationsRepository);
container.register("OTPsRepository", OTPsRepository);
