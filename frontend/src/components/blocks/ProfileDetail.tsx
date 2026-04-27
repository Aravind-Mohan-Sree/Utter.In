import { GrCertificate } from 'react-icons/gr';

interface ProfileDetailProps {
  bio?: string;
  languages?: string[];
  experience?: string;
  certificationTypes?: string[];
}

export default function ProfileDetail({
  bio,
  languages,
  experience,
  certificationTypes,
}: ProfileDetailProps) {
  return (
    <div className="space-y-6">
      {bio && (
        <div className="wrap-anywhere">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Bio</h4>
          <p className="text-gray-600">{bio}</p>
        </div>
      )}

      {languages && languages.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            Known Languages
          </h4>
          <div className="flex flex-wrap gap-2">
            {languages.map((language) => (
              <span
                key={language}
                className="bg-rose-100 text-rose-400 px-3 py-1 rounded-full text-sm font-medium border border-rose-200"
              >
                {language}
              </span>
            ))}
          </div>
        </div>
      )}

      {experience && (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            Teaching Experience
          </h4>
          <span className="bg-rose-100 text-rose-400 px-3 py-1 rounded-full text-sm font-medium border border-rose-200">
            {experience} years
          </span>
        </div>
      )}

      {certificationTypes && certificationTypes.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            Certifications
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certificationTypes.map((type) => (
              <div
                key={type}
                className="flex items-center space-x-3 p-4 bg-rose-100 rounded-lg border border-rose-200"
              >
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-rose-400 rounded-lg">
                  <GrCertificate size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-rose-400 text-sm leading-tight">
                    {type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
