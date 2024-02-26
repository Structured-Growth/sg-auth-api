/**
* IMPORTANT NOTE!
* This file was auto-generated with tsoa.
* Please do not modify it. Re-run tsoa to re-generate this file
*/

import { Router } from "express";
import { container, handleRequest } from "@structured-growth/microservice-sdk";
import * as Controllers from "../controllers/v1";

const handlerOpts = {
    logRequestBody: container.resolve<boolean>('logRequestBody'),
    logResponses: container.resolve<boolean>('logResponses'),
}

export const router = Router();
const pathPrefix = process.env.URI_PATH_PREFIX || '';

//PingController
router.get(pathPrefix + '/v1/ping/alive', handleRequest(Controllers.PingController, "pingGet", handlerOpts));

//CredentialsController
router.get(pathPrefix + '/v1/credentials', handleRequest(Controllers.CredentialsController, "search", handlerOpts));
router.post(pathPrefix + '/v1/credentials', handleRequest(Controllers.CredentialsController, "create", handlerOpts));
router.put(pathPrefix + '/v1/credentials', handleRequest(Controllers.CredentialsController, "check", handlerOpts));
router.get(pathPrefix + '/v1/credentials/:credentialsId', handleRequest(Controllers.CredentialsController, "get", handlerOpts));
router.put(pathPrefix + '/v1/credentials/:credentialsId', handleRequest(Controllers.CredentialsController, "update", handlerOpts));
router.delete(pathPrefix + '/v1/credentials/:credentialsId', handleRequest(Controllers.CredentialsController, "delete", handlerOpts));

//ResolverController
router.get(pathPrefix + '/v1/resolver/resolve', handleRequest(Controllers.ResolverController, "resolve", handlerOpts));
router.get(pathPrefix + '/v1/resolver/actions', handleRequest(Controllers.ResolverController, "actions", handlerOpts));
router.get(pathPrefix + '/v1/resolver/models', handleRequest(Controllers.ResolverController, "models", handlerOpts));

// map is required for correct resolving action by route
export const actionToRouteMap = {
	"PingController.pingGet": 'get /v1/ping/alive',
	"CredentialsController.search": 'get /v1/credentials',
	"CredentialsController.create": 'post /v1/credentials',
	"CredentialsController.check": 'put /v1/credentials',
	"CredentialsController.get": 'get /v1/credentials/:credentialsId',
	"CredentialsController.update": 'put /v1/credentials/:credentialsId',
	"CredentialsController.delete": 'delete /v1/credentials/:credentialsId',
	"ResolverController.resolve": 'get /v1/resolver/resolve',
	"ResolverController.actions": 'get /v1/resolver/actions',
	"ResolverController.models": 'get /v1/resolver/models',
};
