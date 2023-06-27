// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { getTransactionSender } from '@mysten/sui.js';
import React, { useState } from 'react';
import { type Direction } from 'react-resizable-panels';

import { type DataType } from '../ObjectResultType';

import styles from './ObjectView.module.css';

import TransactionBlocksForAddress, {
	FILTER_VALUES,
} from '~/components/TransactionBlocksForAddress/TransactionBlocksForAddress';
import { ErrorBoundary } from '~/components/error-boundary/ErrorBoundary';
import { type VersionInfo } from '~/components/module/DependencyView';
import PkgModulesWrapper, {
	type Codes,
	type ModuleType,
} from '~/components/module/PkgModulesWrapper';
import VerifyRegister from '~/components/module/VerifyRegister';
import { useGetTransaction } from '~/hooks/useGetTransaction';
import { AddressLink, ObjectLink } from '~/ui/InternalLink';
import { LoadingSpinner } from '~/ui/LoadingSpinner';
import { RadioGroup, RadioOption } from '~/ui/Radio';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '~/ui/Tabs';
import { getOwnerStr } from '~/utils/objectUtils';
import { trimStdLibPrefix } from '~/utils/stringUtils';

const GENESIS_TX_DIGEST = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';

const splitPanelsOrientation: { label: string; value: Direction }[] = [
	{ label: 'STACKED', value: 'vertical' },
	{ label: 'SIDE-BY-SIDE', value: 'horizontal' },
];

function PkgView({ data, codes, verified, setVerified, versionInfo }: { data: DataType; codes: Codes; verified: boolean; setVerified: Function; versionInfo?: VersionInfo }) {
	const [selectedSplitPanelOrientation, setSplitPanelOrientation] = useState(
		splitPanelsOrientation[1].value,
	);

	const { data: txnData, isLoading } = useGetTransaction(data.data.tx_digest!);

	if (isLoading) {
		return <LoadingSpinner text="Loading data" />;
	}
	const viewedData = {
		...data,
		objType: trimStdLibPrefix(data.objType),
		tx_digest: data.data.tx_digest,
		owner: getOwnerStr(data.owner),
		publisherAddress:
			data.data.tx_digest === GENESIS_TX_DIGEST ? 'Genesis' : getTransactionSender(txnData!),
	};

	const checkIsPropertyType = (value: any) => ['number', 'string'].includes(typeof value);

	const properties: ModuleType[] = Object.entries(viewedData.data?.contents)
		.filter(([key, _]) => key !== 'name')
		.filter(([_, value]) => checkIsPropertyType(value));

	return (
		<div>
			<div>
				<TabGroup size="lg">
					<TabList>
						<Tab>Details</Tab>
					</TabList>
					<TabPanels>
						<TabPanel>
							<table className={styles.description} id="descriptionResults">
								<tbody>
									<tr>
										<td>Object ID</td>
										<td id="objectID" className={styles.objectid}>
											<ObjectLink objectId={viewedData.id} noTruncate />
										</td>
									</tr>

									<tr>
										<td>Version</td>
										<td>{viewedData.version}</td>
									</tr>

									{viewedData?.publisherAddress && (
										<tr>
											<td>Publisher</td>
											<td id="lasttxID">
												<AddressLink address={viewedData.publisherAddress} noTruncate />
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</TabPanel>
					</TabPanels>
				</TabGroup>

				<TabGroup size="lg">
					<TabList>
						<div className="mt-16 flex w-full justify-between">
							<div>
								<Tab>Modules</Tab>
								<Tab style={{ marginLeft: '20px' }}>
									Code Verification {verified ? <sup>✔︎</sup> : null}
								</Tab>
							</div>
							<div>
								<RadioGroup
									className="hidden gap-0.5 md:flex"
									ariaLabel="split-panel-bytecode-viewer"
									value={selectedSplitPanelOrientation}
									onChange={setSplitPanelOrientation}
								>
									{splitPanelsOrientation.map(({ value, label }) => (
										<RadioOption key={value} value={value} label={label} />
									))}
								</RadioGroup>
							</div>
						</div>
					</TabList>
					<TabPanels>
						<TabPanel noGap>
							<ErrorBoundary>
								<PkgModulesWrapper
									id={data.id}
									modules={properties}
									codes={codes}
									verified={verified}
									versionInfo={versionInfo}
									splitPanelOrientation={selectedSplitPanelOrientation}
								/>
							</ErrorBoundary>
						</TabPanel>
						<TabPanel noGap>
							<ErrorBoundary>
								<VerifyRegister
									id={data.id}
									modules={properties}
									codes={codes}
									verified={verified}
									setVerified={setVerified}
								/>
							</ErrorBoundary>
						</TabPanel>
					</TabPanels>
				</TabGroup>

				<div className={styles.txsection}>
					<ErrorBoundary>
						<TransactionBlocksForAddress
							address={viewedData.id}
							filter={FILTER_VALUES.INPUT}
							isObject
						/>
					</ErrorBoundary>
				</div>
			</div>
		</div>
	);
}

export default PkgView;
