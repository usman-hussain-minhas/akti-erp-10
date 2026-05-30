import { SettingsControlPanel } from '../../../components/settings/settings_control_panel';

const gatekeeperDenialMessages = {
  forbidden: 'You don’t have permission to make this change. Contact your administrator.',
  approvalRequired: 'This action requires approval. Contact your administrator.',
  apiUnavailable: 'Settings are temporarily unavailable. Try again later.',
};

export default function SettingsPage() {
  return <SettingsControlPanel denialMessages={gatekeeperDenialMessages} />;
}
