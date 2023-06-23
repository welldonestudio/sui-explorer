// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { Combobox } from '@headlessui/react';
import { Search24 } from '@mysten/icons';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import FileUpload from 'react-material-file-upload';

import { type Codes, type ModuleType } from '~/components/module/PkgModulesWrapper';
import { useNetwork } from '~/context';
import { useWdsBackend } from '~/hooks/useWdsBackend';
import { Button } from '~/ui/Button';
import { Link } from '~/ui/Link';
import { ListItem, VerticalList } from '~/ui/VerticalList';
import { useSearchParamsMerged } from '~/ui/utils/LinkWithQuery';
export interface LatestModule {
	account: string;
	chainId: string;
	compileTimestamp: string;
	deployTimestamp: string;
	module: string;
	packageId: string;
	packageName: string;
	srcUrl: string;
	txHash: string;
}
export interface VerifyCheck {
	chainId: string;
	packageId: string;
	isVerified: boolean;
}
interface VerifyRegisterProps {
	id?: string;
	modules?: ModuleType[];
	codes?: Codes;
	verified: boolean;
	setVerified?: Function;
}
interface VerifyRes {
	packageId?: string;
	moduleName?: string;
	requestedTime?: string;
	isVerified: boolean;
	onChainByteCode: string;
	offChainByteCode: string;
}

function VerifyRegister({ id, modules, codes, verified, setVerified }: VerifyRegisterProps) {
	const modulenames = modules?.map(([name]) => name);
	const [searchParams, setSearchParams] = useSearchParamsMerged();
	const [query, setQuery] = useState('');
	// @ts-ignore
	const selectedModule =
		searchParams.get('module') && modulenames?.includes(searchParams.get('module')!)
			? searchParams.get('module')!
			: modulenames[0];

	const [files, setFiles] = useState<File[]>([]);
	const [network] = useNetwork();
	const wdsBack = useWdsBackend();
	const welldoneCodeHref = 'https://docs.welldonestudio.io/code/getting-started';
	const remixHref = 'https://remix.ethereum.org/';

	const verifyWithoutFile = () => {
		console.log(`
        verifyWithoutFiles [Button Clicked]
        network: ${network}
        package ID: ${id}
        Module: ${selectedModule}
        `);
		wdsBack('GET', 'sui-deploy-histories/latest-module', null, {
			chainId: network.toLowerCase(),
			packageId: id,
			module: selectedModule,
		}).then((res) => {
			const data = res as LatestModule;
			fetch(data.srcUrl).then((resFile) => {
				if (!resFile.ok) {
					throw new Error('Network response was not ok');
				}
				resFile.arrayBuffer().then((arrayBuffer) => {
					const blob = new Blob([arrayBuffer], { type: 'application/zip' });
					const curDate = new Date();
					const body = {
						chainName: 'sui',
						chainId: network.toLowerCase(),
						compilerVersion: '1.0.8',
						packageId: id,
						timestamp: curDate.getTime().toString(),
						fileType: 'move',
						zipFile: blob,
					};
					wdsBack('POST', 's3Proxy/verification-src/sui', body).then(() => {
						wdsBack('GET', 'verification/sui', null, {
							chainId: network.toLowerCase(),
							packageId: id,
							moduleName: selectedModule,
							timestamp: curDate.getTime().toString(),
						}).then((verifyRes: VerifyRes | unknown) => {
							console.log('verifyRes', verifyRes);
							// @ts-ignore
							setVerified(verifyRes.isVerified);
						});
					});
				});
			});
		});
	};
	const verifyWithFile = () => {
		console.log(
			`
        verifyWithFile [Button Clicked]
        network: ${network}
        package ID: ${id}
        Module: ${selectedModule}
        File: ${files.length}
        `,
			files[0],
		);
		const curDate = new Date();
		const body = {
			chainName: 'sui',
			chainId: network.toLowerCase(),
			compilerVersion: '1.0.8',
			packageId: id,
			timestamp: curDate.getTime().toString(),
			fileType: 'move',
			zipFile: files[0],
		};
		wdsBack('POST', 's3Proxy/verification-src/sui', body).then(() => {
			wdsBack('GET', 'verification/sui', null, {
				chainId: network.toLowerCase(),
				packageId: id,
				moduleName: selectedModule,
				timestamp: curDate.getTime().toString(),
			}).then((verifyRes: VerifyRes | unknown) => {
				console.log('verifyRes', verifyRes);
				// @ts-ignore
				setVerified(verifyRes.isVerified);
			});
		});
	};
	const filteredModules =
		query === ''
			? modulenames
			: modules
					?.filter(([name]) => name.toLowerCase().includes(query.toLowerCase()))
					.map(([name]) => name);
	const onFileChange = (files: File[]) => {
		console.log('onFileChange files', files);
		setFiles(files);
	};
	const submitSearch = useCallback(() => {
		if (filteredModules.length === 1) {
			setSearchParams({
				module: filteredModules[0],
			});
		}
	}, [filteredModules, setSearchParams]);
	const onChangeModule = (newModule: string) => {
		setSearchParams({
			module: newModule,
		});
	};
	return (
		// <div className="flex items-center gap-1 truncate break-words text-body font-medium leading-relaxed text-steel-dark">
		// <div className="min-w-0 basis-full break-words md:basis-2/3">
		// <div className="block w-full truncate break-words">
		// text-issue-dark text-steel-dark text-bodySmall text-body text-subtitle
		/*
    <Tooltip tip="Transaction sent at RGP will process promptly during regular network operations">
        <Info12 className="h-3.5 w-3.5" />
    </Tooltip>
     */
		<div className="flex flex-col gap-5 border-b border-gray-45 md:flex-row md:flex-nowrap">
			<div className="w-full md:w-1/5">
				<Combobox value={selectedModule} onChange={onChangeModule}>
					<div className="mt-2.5 flex w-full justify-between rounded-md border border-gray-50 py-1 pl-3 placeholder-gray-65 shadow-sm">
						<Combobox.Input
							onChange={(event) => setQuery(event.target.value)}
							displayValue={() => query}
							placeholder="Search"
							className="w-full border-none"
						/>
						<button onClick={submitSearch} className="border-none bg-inherit pr-2" type="submit">
							<Search24 className="h-4.5 w-4.5 cursor-pointer fill-steel align-middle text-gray-60" />
						</button>
					</div>
					<Combobox.Options className="absolute left-0 z-10 flex h-fit max-h-verticalListLong w-full flex-col gap-1 overflow-auto rounded-md bg-white px-2 pb-5 pt-3 shadow-moduleOption md:left-auto md:w-1/6">
						{filteredModules.length > 0 ? (
							<div className="ml-1.5 pb-2 text-caption font-semibold uppercase text-gray-75">
								{filteredModules.length}
								{filteredModules.length === 1 ? ' Result' : ' Results'}
							</div>
						) : (
							<div className="px-3.5 pt-2 text-center text-body italic text-gray-70">
								No results
							</div>
						)}
						{filteredModules.map((name) => (
							<Combobox.Option key={name} value={name} className="list-none md:min-w-fit">
								{({ active }) => (
									<button
										type="button"
										className={clsx(
											'mt-0.5 block w-full cursor-pointer rounded-md border px-1.5 py-2 text-left text-body',
											active
												? 'border-transparent bg-sui/10 text-gray-80'
												: 'border-transparent bg-white font-medium text-gray-80',
										)}
									>
										{name}
									</button>
								)}
							</Combobox.Option>
						))}
					</Combobox.Options>
				</Combobox>
				<div className="h-verticalListShort overflow-auto pt-3 md:h-verticalListLong">
					<VerticalList>
						{modulenames.map((name) => (
							<div key={name} className="mx-0.5 mt-0.5 md:min-w-fit">
								<ListItem active={selectedModule === name} onClick={() => onChangeModule(name)}>
									{name}
								</ListItem>
							</div>
						))}
					</VerticalList>
				</div>
			</div>
			<div className="h-full grow overflow-auto border-gray-45 pt-5 md:pl-7">
				{verified ? (
					<div className="text-subtitleMedium mb-4 mt-1 break-words">
						✔︎ <span className="font-bold">This code is verified.</span>
					</div>
				) : (
					<>
						{verified ? (
							<div className="text-subtitleMedium mb-4 mt-1 break-words">
								<span className="font-bold">Verification Success !! ✅</span>
							</div>
						) : (
							<>
								<div className="text-subtitleMedium mb-4 mt-1 break-words">
									❗<span className="font-bold">Not yet verified.</span>
								</div>
								<div className="mb-0.5 break-words text-issue-dark">
									If this code is deployed using{' '}
									<Link
										variant="text"
										color="steel-darker"
										href={welldoneCodeHref}
										target="_blank"
										rel="noopener noreferrer"
									>
										<span className="underline">WELLDONE Code</span>
									</Link>{' '}
									and{' '}
									<Link
										variant="text"
										color="steel-darker"
										href={remixHref}
										target="_blank"
										rel="noopener noreferrer"
									>
										<span className="underline">remix plugin ( CODE BY WELLDONE STUDIO )</span>
									</Link>
									, you can proceed verification without uploading a file.
								</div>
								<Button size="md" onClick={verifyWithoutFile} variant="outline">
									Verify without file.
								</Button>

								<div className="mb-0.5 mt-7 break-words text-issue-dark">
									Otherwise You can proceed verification with uploading a file{' '}
									<span className="font-medium">(a zip file)</span>.
								</div>
								<FileUpload value={files} maxFiles={1} onChange={onFileChange} />
								<div className="mb-1 ml-1 mt-2 break-words text-body font-medium">
									1. Run this command "zip -r your_source.zip ." at the same directory path of
									"Move.toml".
								</div>
								<div className="mb-2 ml-1 break-words text-body font-medium">
									2. Drag the zip file above upload box.
								</div>
								<Button
									size="md"
									onClick={verifyWithFile}
									variant="outline"
									disabled={files.length === 0}
								>
									Verify with a zip file.
								</Button>
								<div className="ml-1 mt-5 break-words text-body font-medium">
									Network: {network.toLowerCase()}
								</div>
								<div className="ml-1 break-words text-body font-medium">Package ID: {id}</div>
								<div className="ml-1 break-words text-body font-medium">
									Module: {selectedModule}
								</div>
							</>
						)}
					</>
				)}
			</div>
		</div>
	);
}

export default VerifyRegister;
