// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { type ModuleType } from '~/components/module/PkgModulesWrapper';
import { shortenPackageId } from '~/components/module/utils';
import { CopyToClipboard } from '~/ui/CopyToClipboard';
import { ObjectLink } from '~/ui/InternalLink';
import { Tooltip } from '~/ui/Tooltip';
import { ReactComponent as InfoSvg } from '~/ui/icons/info_10x10.svg';

interface Props {
	id?: string;
	modules: ModuleType[];
	versionInfo?: VersionInfo;
	selectedModuleName: string;
	verified?: boolean;
}

export interface VersionInfo {
	network: string;
	packageId: string;
	modules: Array<DependencyModule>;
}

export interface DependencyModule {
	module: string;
	dependencies?: Array<Dependency>;
}

export interface Dependency {
	packageId: string;
	upgradeCapId?: string;
	current?: Current;
	latest?: Latest;
}

export interface Current {
	packageId: string;
	version: number;
}

export interface Latest {
	packageId: string;
	version: number;
}

function DependencyView({ id, modules, versionInfo, selectedModuleName }: Props) {
	const selectedModule = versionInfo?.modules.find(
		(element) => element.module === selectedModuleName,
	);
	return (
		<>
			<div className="title mb-4 break-words font-medium">
				Module( <b>{selectedModuleName}</b> ) has <b>{selectedModule?.dependencies?.length}</b>{' '}
				{selectedModule?.dependencies?.length === 1 ? <>dependency.</> : <>dependencies.</>}
			</div>
			{selectedModule?.dependencies?.map((dependency, idx) => (
				<div key={idx} className="mb-6">
					<div className="whitespace-nowrap text-body font-bold">
						Package ID :{' '}
						<ObjectLink
							objectId={shortenPackageId(dependency.packageId)}
							noTruncate
							target="_blank"
						/>{' '}
						<CopyToClipboard size="md" color="steel" copyText={dependency.packageId} />
					</div>
					{dependency.upgradeCapId ? (
						<div className="whitespace-nowrap text-body">
							UpgradeCap ID :{' '}
							<ObjectLink
								objectId={shortenPackageId(dependency.upgradeCapId)}
								noTruncate
								target="_blank"
							/>{' '}
							<CopyToClipboard size="md" color="steel" copyText={dependency.upgradeCapId} />
						</div>
					) : (
						<div className="whitespace-nowrap text-body">
							UpgradeCap ID : <span style={{ color: 'orangered' }}>Deleted</span>
						</div>
					)}
					{/*<div className="text-subtitleMedium">Current</div>*/}
					<div className="title flex items-center gap-1">
						Current
						<Tooltip tip="This is the current information of the package this module is referencing." isInline>
							<InfoSvg />
						</Tooltip>
					</div>
					<li className="whitespace-nowrap text-body font-medium">
						Package ID :{' '}
						<ObjectLink
							objectId={shortenPackageId(dependency?.current?.packageId)}
							noTruncate
							target="_blank"
						/>{' '}
						<CopyToClipboard
							size="md"
							color="steel"
							copyText={dependency?.current?.packageId ?? ''}
						/>
					</li>
					<li className="whitespace-nowrap text-body font-medium">
						Version : <span style={{ color: 'blue' }}>{dependency?.current?.version}</span>
					</li>
					{/*<div className="text-body font-bold">Latest</div>*/}
					<div className="title flex items-center gap-1">
						Latest
						<Tooltip tip="This is the latest information of the package this module is referencing." isInline>
							<InfoSvg />
						</Tooltip>
					</div>
					<li className="whitespace-nowrap text-body font-medium">
						Package ID :{' '}
						<ObjectLink
							objectId={shortenPackageId(dependency?.latest?.packageId)}
							noTruncate
							target="_blank"
						/>{' '}
						{dependency?.latest?.packageId ? (
							<CopyToClipboard
								size="md"
								color="steel"
								copyText={dependency?.latest?.packageId ?? ''}
							/>
						) : null}
					</li>
					<li className="whitespace-nowrap text-body font-medium">
						Version :{' '}
						{dependency?.current?.version === dependency?.latest?.version ? (
							<span style={{ color: 'blue' }}>{dependency?.latest?.version}</span>
						) : (
							<b style={{ color: 'red' }}>{dependency?.latest?.version}</b>
						)}
					</li>
				</div>
			))}
		</>
	);
}

export default DependencyView;
