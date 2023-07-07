import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { generateResponse, getContainer } from "./lib/utils";
import config from './lib/constants';
import { validateStoreAndCard } from "../../common/cardValidator";
import {  CardDetails } from "../../common/models";
import { PatchRequestBody } from "@azure/cosmos";

export async function reportCard(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {

    let cardRequest: CardDetails;
    const op: PatchRequestBody = [{ op: "incr", path: "/flagged", value: 1 }];

    try {
        cardRequest = await request.json() as CardDetails;
    } catch (err) {
        return generateResponse(400, 'Invalid request.', context);
    }

    const validationCheck = validateStoreAndCard(cardRequest.store, cardRequest.cardNumber);

    if (!validationCheck.valid) {
        return generateResponse(400, validationCheck.msg, context);
    }

    const cardNumberContainer = getContainer(config.DATABASE, config.CARD_NUMBER_CONTAINER)
    const cardItem = await cardNumberContainer.item(cardRequest.cardNumber, cardRequest.store).read();

    if (cardItem.statusCode === 200) {
        await cardItem.item.patch(op);
        return generateResponse(200, `Card ${cardRequest.cardNumber} for store ${cardRequest.store} flagged.`, context);
    } else {
        return generateResponse(404, `Card ${cardRequest.cardNumber} does not exist in the ${cardRequest.store} database.`, context);
    }
}

app.http('reportCard', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: reportCard
});
