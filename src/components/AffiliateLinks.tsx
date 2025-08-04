import React, { useState } from 'react';
import { UploadCloud, ExternalLink, Copy, CheckCircle } from 'lucide-react';

const affiliateLinks = [
  { name: 'FundingTraders', url: 'https://app.fundingtraders.com/login?ref=afi6924691', icon: '💰' },
  { name: 'BlueberryFunded', url: 'https://blueberryfunded.com/?utm_source=affiliate&ref=4802', icon: '🫐' },
  { name: 'Funded Firm', url: 'https://my.fundedfirm.com/register?ref=7ac25577d6e1ffa', icon: '🏢' },
  { name: 'FundingPips', url: 'https://app.fundingpips.com/register?ref=dc5afd84', code: 'dc5afd84', icon: ' PIP ' },
  { name: 'Instant Funding', url: 'https://instantfunding.com/?partner=5846', icon: '⚡️' },
];

const AffiliateLinks: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('screenshot', selectedFile);

    try {
      const response = await fetch('/api/upload-screenshot', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadStatus('Screenshot uploaded successfully! Please allow 24-48 hours for confirmation.');
        setSelectedFile(null);
      } else {
        setUploadStatus('Failed to upload screenshot. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      setUploadStatus('An error occurred while uploading. Please try again.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Kickstarter Affiliate Program
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Purchase an account from one of our trusted prop firm partners below to get free access to our premium features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {affiliateLinks.map((link) => (
            <div key={link.name} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 transition-all duration-300 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{link.icon}</span>
                <h2 className="text-xl font-bold">{link.name}</h2>
              </div>
              {link.code && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-1">Use this code at checkout:</p>
                  <div className="flex items-center justify-between bg-gray-900/70 rounded-lg p-2">
                    <span className="font-mono text-blue-400">{link.code}</span>
                    <button onClick={() => copyToClipboard(link.code)} className="text-gray-400 hover:text-white">
                      {copiedCode ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Visit Site <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          ))}
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
          <div className="text-center">
            <UploadCloud className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Upload Your Proof of Purchase</h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              After your purchase, upload a screenshot of the confirmation. We'll verify it and unlock your dashboard access within 24-48 hours.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-center w-full mb-4">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-900/50 hover:bg-gray-800/70">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                  {selectedFile ? (
                    <p className="font-semibold text-blue-400">{selectedFile.name}</p>
                  ) : (
                    <>
                      <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x400px)</p>
                    </>
                  )}
                </div>
                <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" />
              </label>
            </div>
            
            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Upload & Get Access
            </button>

            {uploadStatus && (
              <p className={`mt-4 text-center ${uploadStatus.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>
                {uploadStatus}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateLinks;
