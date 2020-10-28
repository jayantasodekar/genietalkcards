// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { GenietalkCard } from "../../card-elements";

test('GenietalkCard should be instantiated', () => {
    const genietalkCard = new GenietalkCard();
    expect(genietalkCard).toEqual(expect.anything());
})
