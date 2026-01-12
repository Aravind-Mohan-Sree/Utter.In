import { GrCertificate } from 'react-icons/gr';

interface ProfileDetailProps {
  bio?: string;
  languages?: string[];
  experience?: string;
  certification?: string;
}

export default function ProfileDetail({
  bio,
  languages,
  experience,
  certification,
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

      {certification && (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            Certification
          </h4>
          <div className="flex items-center space-x-3 p-4 bg-rose-100 rounded-lg border border-rose-200">
            {/* Icon Container */}
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-rose-400 rounded-lg">
              <GrCertificate size={30} />
            </div>
            {/* Text Content */}
            <div className="flex-1">
              <div className="font-semibold text-gray-900 text-sm leading-tight">
                {certification}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
