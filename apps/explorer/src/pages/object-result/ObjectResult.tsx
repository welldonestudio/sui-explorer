// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useGetObject } from '@mysten/core';
import JSZip from 'jszip';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { translate, type DataType } from './ObjectResultType';
import PkgView from './views/PkgView';
import { TokenView } from './views/TokenView';

import { ErrorBoundary } from '~/components/error-boundary/ErrorBoundary';
import { type Codes } from '~/components/module/PkgModulesWrapper';
import { type LatestModule, type VerifyCheck } from '~/components/module/VerifyRegister';
import { useNetwork } from '~/context';
import { useWdsBackend } from '~/hooks/useWdsBackend';
import { Banner } from '~/ui/Banner';
import { LoadingSpinner } from '~/ui/LoadingSpinner';
import { PageHeader } from '~/ui/PageHeader';

const PACKAGE_TYPE_NAME = 'Move Package';

function Fail({ objID }: { objID: string | undefined }) {
	return (
		<Banner variant="error" spacing="lg" fullWidth>
			Data could not be extracted on the following specified object ID: {objID}
		</Banner>
	);
}

export function ObjectResult() {
	const [network] = useNetwork();

	const { id: objID } = useParams();
	const { data, isLoading, isError, isFetched } = useGetObject(objID!);
	console.log(
		'ObjectResult',
		data,
		' isLoading',
		isLoading,
		' isError',
		isError,
		' isFetched',
		isFetched,
	);
	const wdsBack = useWdsBackend();
	const [codes, setCodes] = useState<Codes>({
		codes: [''],
	});
	const [verified, setVerified] = useState(false);

	useEffect(() => {
		if (!data) {
			return;
		}
		// @ts-ignore
		// eslint-disable-next-line no-unsafe-optional-chaining
		const { disassembled } = data.data?.content;
		const moduleName = Object.keys(disassembled)[0];
		const packageId = data.data?.objectId;
		console.log(packageId, moduleName);

		wdsBack('GET', 'verification/sui/verify-check', null, {
			chainId: network.toLowerCase(),
			packageId: packageId,
		}).then((res) => {
			const verifyCheckObj = res as VerifyCheck;
			wdsBack('GET', 'sui-deploy-histories/latest-module', null, {
				chainId: network.toLowerCase(),
				packageId: packageId,
				module: moduleName,
			}).then((res) => {
				const data = res as LatestModule;
				fetch(data.srcUrl).then((resFile) => {
					if (!resFile.ok) {
						throw new Error('Network response was not ok');
					}
					resFile.arrayBuffer().then((arrayBuffer) => {
						const blob = new Blob([arrayBuffer], { type: 'application/zip' });
						const zip = new JSZip();
						zip.loadAsync(blob).then((unzipped) => {
							const filePromises: any = [];
							unzipped.forEach((relativePath: any, file: any) => {
								if (!file.dir) {
									const filePromise = file
										.async('text')
										.then((content: any) => ({ name: file.name, content: content }));
									filePromises.push(filePromise);
								}
							});

							Promise.all(filePromises).then((codes) => {
								setCodes({
									codes: codes.filter((code) => {
										if (!code.name.includes('Move.toml' || 'Move.lock')) {
											return code;
										}
									}),
								});
								setVerified(verifyCheckObj.isVerified);
							});
						});
					});
				});
			});
		});
	}, [data]);

	if (isLoading) {
		return (
			<div className="flex w-full items-center justify-center">
				<LoadingSpinner text="Loading data" />
			</div>
		);
	}

	if (isError) {
		return <Fail objID={objID} />;
	}

	// TODO: Handle status better NotExists, Deleted, Other
	if (data.error || (isFetched && !data)) {
		return <Fail objID={objID} />;
	}

	const resp = translate(data);
	const isPackage = resp.objType === PACKAGE_TYPE_NAME;
	Object.assign(resp, {
		codes,
		verified,
		setVerified,
	});

	return (
		<div className="mb-10">
			<PageHeader type={isPackage ? 'Package' : 'Object'} title={resp.id} />

			<ErrorBoundary>
				<div className="mt-10">
					{isPackage ? (
						<PkgView data={resp} />
					) : (
						<TokenView data={data} />
					)}
				</div>
			</ErrorBoundary>
		</div>
	);
}

export type { DataType };
