// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import ModuleView from '~/components/module/ModuleView';
import { type Codes, type ModuleType } from '~/components/module/PkgModulesWrapper';

interface VerifiedModuleViewWrapperProps {
	id?: string;
	selectedModuleName: string;
	modules: ModuleType[];
	codes?: Codes;
	verified?: boolean;
}

function VerifiedModuleViewWrapper({
	id,
	selectedModuleName,
	modules,
	codes,
	verified,
}: VerifiedModuleViewWrapperProps) {
	const selectedModuleData = modules.find(([name]) => name === selectedModuleName);
	if (!selectedModuleData) {
		return null;
	}
	const [name] = selectedModuleData;

	const code = codes?.codes.find((element: any) => {
		if (element.content.includes(`::${name}`)) {
			return true;
		}
	});

	return verified ? (
		<ModuleView id={id} name={name} code={code?.content} />
	) : (
		<div className="text-subtitleMedium mb-4 mt-2 break-words">
			❗<span className="font-bold">Not yet verified.</span>
		</div>
	);
}

export default VerifiedModuleViewWrapper;
