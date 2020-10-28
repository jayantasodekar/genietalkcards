// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import {GenietalkCard,TextBlock} from "../../card-elements";

test('TextBlock should be instantiated', ()=>{
    const textBlock = new TextBlock();
    expect(textBlock).toEqual(expect.anything());
})

const emoji_message = "Mix 🗣 emoji inside 🙌 text";
const simple_test_card = {
    "$schema": "http://genietalkcards.io/schemas/genietalk-card.json",
    "type": "GenietalkCard",
    "version": "1.0",
    "body": [{
        "type": "TextBlock",
        "text": emoji_message
    }]
};

// TODO: confirm this test working as expected
// test('TextBlock should allow for Unicode chars including Emoji', ()=>{
//     const ac = new GenietalkCard();
//     ac.parse(simple_test_card);
//     const result = ac.render();
//     const text = result.textContent.trim();
//     expect(text).toEqual(emoji_message);
// });
