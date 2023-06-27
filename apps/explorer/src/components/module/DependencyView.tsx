// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { ModuleType } from '~/components/module/PkgModulesWrapper';
import { shortenPackageId } from '~/components/module/utils';
import { ObjectLink } from '~/ui/InternalLink';
import React from "react";

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
					<div className="title whitespace-nowrap font-medium">
						Package ID : <ObjectLink objectId={shortenPackageId(dependency.packageId)} noTruncate target='_blank' />
					</div>
					{dependency.upgradeCapId ? (
						<div className="title whitespace-nowrap break-words">
							UpgradeCap ID : <ObjectLink objectId={shortenPackageId(dependency.upgradeCapId)} noTruncate target='_blank' />
						</div>
					) : (
						<div className="title whitespace-nowrap break-words">
							UpgradeCap ID : <span style={{ color: 'orangered' }}>Deleted</span>
						</div>
					)}
					{/*<div className="text-subtitleMedium">Current</div>*/}
					<div className="title">Current</div>
					<li className="whitespace-nowrap break-words text-body font-medium">
						Package ID : <ObjectLink objectId={shortenPackageId(dependency?.current?.packageId)} noTruncate target='_blank' />
					</li>
					<li className="whitespace-nowrap break-words text-body font-medium">
						Version : <span style={{ color: 'blue' }}>{dependency?.current?.version}</span>
					</li>
					{/*<div className="text-body font-bold">Latest</div>*/}
					<div className="title">Latest</div>
					<li className="whitespace-nowrap break-words text-body font-medium">
						Package ID : <ObjectLink objectId={shortenPackageId(dependency?.latest?.packageId)} noTruncate target='_blank' />
					</li>
					<li className="whitespace-nowrap break-words text-body font-medium">
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
