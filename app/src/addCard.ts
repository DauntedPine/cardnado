import { validateStoreAndCard } from '../../common/cardValidator';
import { setInfo } from './utils';
import constants from './constants';
import { CardDetails } from '../../common/models';

const checkboxId = '#accept-checkbox';
const checkboxLabelId = '#checkbox-label';
const storeSelector = $('#store-selector');
const cardNumberInput = $('#card-number');


export async function addCard() {
    const store = storeSelector.val() as string;
    const cardNumber = cardNumberInput.val() as string;
    const validationResult = validateStoreAndCard(store, cardNumber);
    const checkbox = $(checkboxId);
    const checkboxLabel = $(checkboxLabelId);
    checkboxLabel.removeClass('text-danger');

    if (validationResult.valid) {
        const addCardRequest: CardDetails = {
            store: store,
            cardNumber: cardNumber
        };
        if (checkbox.is(':checked')) {
            $.post(constants.addCardUrl, JSON.stringify(addCardRequest))
                .done(function (data: any) {
                    setInfo(data.message, 'success');
                })
                .fail(function (data: any) {
                    setInfo(data.responseJSON.message, 'warning');
                });
        } else {
            setInfo('Please accept sharing this.', 'warning');
            checkboxLabel.addClass('text-danger');
        }

    }
    else {
        setInfo(validationResult.msg, 'warning');
    }
}

