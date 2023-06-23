// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import axios, { type AxiosResponse } from 'axios';
import { useCallback } from 'react';

export function useWdsBackend() {
	const url = 'https://api.welldonestudio.io/compiler';

	return useCallback(
		async <T>(
			method: string,
			path: string,
			body?: any,
			queryString?: Record<string, any>,
			options?: RequestInit,
		): Promise<T | undefined> => {
			console.log('method', method, 'path', path, 'options', options);
			if (body) {
				console.log('body', body);
			}
			if (queryString) {
				console.log('queryString', queryString);
			}
			if (method === 'GET') {
				const query = new URLSearchParams(queryString);
				const res = await fetch(`${url}/${path}?${query}`, options);
				if (!res.ok) {
					throw new Error('Unexpected response');
				}
				return res.json();
			} else if (method === 'POST') {
				const requestOptions = {
					method: 'POST',
					headers: {
						'Content-Type': 'multipart/form-data',
						Accept: 'application/json',
					},
					body,
				};
				console.log('url', url, 'path', path);
				console.log('requestOptions', requestOptions);
				let res: AxiosResponse = await axios.post(`${url}/${path}`, body, {
					headers: {
						'Content-Type': 'multipart/form-data',
						Accept: 'application/json',
					},
				});
				if (res.status !== 201) {
					throw new Error('Unexpected response');
				}
				console.log('res', res);
			}
		},
		[],
	);
}
