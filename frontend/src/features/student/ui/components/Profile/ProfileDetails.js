import React from 'react';
import ProfileOverviewCard from './ProfileOverviewCard';
import AcademicSummary from './AcademicSummary';
import ContactInfo from './ContactInfo';
import AccountInfo from './AccountInfo';

export default function ProfileDetails({
  profile,
  canDisplayImage,
  directImageUrl,
  formatDateVN,
  getGenderDisplay,
  getStatusText
}) {
  return (
    <div className="space-y-6">
      <ProfileOverviewCard profile={profile} canDisplayImage={canDisplayImage} directImageUrl={directImageUrl} />
      <AcademicSummary profile={profile} formatDateVN={formatDateVN} getGenderDisplay={getGenderDisplay} />
      <ContactInfo profile={profile} />
      <AccountInfo profile={profile} formatDateVN={formatDateVN} getStatusText={getStatusText} />
    </div>
  );
}

