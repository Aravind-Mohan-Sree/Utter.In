interface ProfileDetailProps {
  bio?: string;
  languages?: string[];
  experience?: string;
}

export default function ProfileDetail({
  bio,
  languages,
  experience,
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
                className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-sm font-medium border border-rose-200"
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
          <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-sm font-medium border border-rose-200">
            {experience}
          </span>
        </div>
      )}
    </div>
  );
}
