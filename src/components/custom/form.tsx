import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FaCopy } from "react-icons/fa";

export function TabsDemo() {
  const [isDisabled, setIsDisabled] = useState(true);
  const [submit, setSubmit] = useState(false);
  const [plainText, setPlainText] = useState("");
  const [encryptedText, setEncryptedText] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");

  const [submitDecrypt, setSubmitDecrypt] = useState(false);
  const [toDecrypt, setToDecrypt] = useState("");
  const [decryptionKey, setDecryptionKey] = useState("");
  const [disabledDecrypt, setDisabledDecrypt] = useState(true);
  const [decryptedText, setDecryptedText] = useState("");

  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPlainText(value);
    setIsDisabled(value.trim() === "");
  };

  const handleEncryptedTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setToDecrypt(e.target.value);
    setDisabledDecrypt(
      e.target.value.trim() === "" || decryptionKey.trim() === ""
    );
  };

  const handleDecryptionKeyChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDecryptionKey(e.target.value);
    setDisabledDecrypt(toDecrypt.trim() === "" || e.target.value.trim() === "");
  };

  const handleSubmit = () => {
    const key = generateEncryptionKey();
    const encrypted = encryptWithCustomAlgorithm(plainText, key);

    setEncryptionKey(key);
    setEncryptedText(encrypted);
    setSubmit(true);
    setIsDisabled(true);
  };

  const handleDecrypt = () => {
    const decrypted = decryptWithCustomAlgorithm(encryptedText, decryptionKey);

    setDecryptedText(decrypted);
    setSubmitDecrypt(true);
    setDisabledDecrypt(true);
  };

  const generateEncryptionKey = () => {
    const randomLength = Math.floor(Math.random() * 11) + 5;
    let randomString = Math.random().toString(36).substring(2);

    randomString = randomString.replace(/[0-9]/g, "");

    while (randomString.length < randomLength) {
      randomString += Math.random()
        .toString(36)
        .replace(/[0-9]/g, "")
        .substring(2);
    }

    return randomString.substring(0, randomLength);
  };

  function encryptWithCustomAlgorithm(plaintext: string, key: string): string {
    const normalizedKey = key.toLowerCase();
    const keyLength = normalizedKey.length;

    // Reverse the plaintext for additional obfuscation
    plaintext = plaintext.split("").reverse().join("");

    const charToIndex = (char: string): number => {
      const code = char.toLowerCase().charCodeAt(0);
      return code >= 97 && code <= 122 ? code - 96 : 0; // a=1, b=2, ..., z=26
    };

    const indexToChar = (index: number, isUpperCase: boolean): string => {
      const base = isUpperCase ? 65 : 97; // Uppercase starts at 65, lowercase at 97
      return String.fromCharCode(((index - 1) % 26) + base);
    };

    const spaceReplacement = [
      "#~",
      "$%",
      "4%",
      "12&",
      "3(",
      "30)",
      "~*",
      "&+",
    ].sort(
      () => Math.random() - 0.5 // Randomize space replacements for extra complexity
    );

    return plaintext
      .split("")
      .map((char, index) => {
        if (char === " ") {
          return spaceReplacement[index % spaceReplacement.length];
        }

        const isUpperCase = char === char.toUpperCase();
        const charIndex = charToIndex(char);

        if (charIndex === 0) return char; // Non-alphabetic character remains unchanged

        // Multistage shift: First stage is key length, second stage adds key mod
        const stage1Shift = charIndex + keyLength; // First stage shift
        const stage2Shift = stage1Shift + (keyLength % 5); // Add a secondary shift mod 5

        return indexToChar(stage2Shift, isUpperCase); // Convert back to a character
      })
      .join("");
  }

  function decryptWithCustomAlgorithm(
    encryptedText: string,
    key: string
  ): string {
    const normalizedKey = key.toLowerCase();
    const keyLength = normalizedKey.length;

    const charToIndex = (char: string): number => {
      const code = char.toLowerCase().charCodeAt(0);
      return code >= 97 && code <= 122 ? code - 96 : 0; // a=1, b=2, ..., z=26
    };

    const indexToChar = (index: number, isUpperCase: boolean): string => {
      const base = isUpperCase ? 65 : 97;
      return String.fromCharCode(((index - 1 + 26) % 26) + base);
    };

    const spaceReplacements = [
      "#~",
      "$%",
      "4%",
      "12&",
      "3(",
      "30)",
      "~*",
      "&+",
    ];

    let decryptedText = "";
    let i = 0;

    while (i < encryptedText.length) {
      let foundSpaceReplacement = false;

      // Check for space replacements
      for (const replacement of spaceReplacements) {
        if (encryptedText.startsWith(replacement, i)) {
          decryptedText += " ";
          i += replacement.length; // Move past the space replacement
          foundSpaceReplacement = true;
          break;
        }
      }

      if (!foundSpaceReplacement) {
        const char = encryptedText[i];
        const isUpperCase = char === char.toUpperCase();
        const charIndex = charToIndex(char);

        if (charIndex === 0) {
          decryptedText += char;
        } else {
          // Reverse the multistage shift
          const stage2Shift = charIndex - (keyLength % 5); // Undo second stage shift
          const stage1Shift = stage2Shift - keyLength; // Undo first stage shift

          decryptedText += indexToChar(stage1Shift, isUpperCase);
        }
        i++;
      }
    }

    // Reverse the decrypted text to restore the original plaintext
    return decryptedText.split("").reverse().join("");
  }

  const copyToClipboard = (
    id: string,
    customToast: { title: string; description: string, position?: string }
  ) => {
    const element = document.getElementById(id) as
      | HTMLInputElement
      | HTMLTextAreaElement;
    if (element) {
      navigator.clipboard.writeText(element.value || "").then(() => {
        toast(customToast);
      });
    }
  };

  const resetForm = () => {
    setPlainText("");
    setEncryptedText("");
    setEncryptionKey("");
    setIsDisabled(true);
    setSubmit(false);
  };

  return (
    <Tabs defaultValue="encrypt" className="w-full max-w-[500px] mx-auto p-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="encrypt" className="text-sm md:text-base">
          Encrypt
        </TabsTrigger>
        <TabsTrigger value="decrypt" className="text-sm md:text-base">
          Decrypt
        </TabsTrigger>
      </TabsList>

      <TabsContent value="encrypt">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Encrypt</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Enter the text you want to encrypt, and we’ll securely transform
              it into an encoded format.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Textarea
                className="w-full"
                value={plainText}
                onChange={handleInputChange}
                placeholder="Enter text here..."
              ></Textarea>
            </div>
          </CardContent>

          {submit && (
            <div>
              <CardContent className="fade-in visible space-y-2">
                <Label htmlFor="encryptionKey" className="text-sm">
                  Encryption Key
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="encryptionKey"
                    className="w-full"
                    value={encryptionKey}
                    readOnly
                  />
                  <Button
                    style={{ zIndex: 10 }}
                    variant="secondary"
                    size="sm"
                    onClick={() => 
                        copyToClipboard("encryptionKey", {
                          title: "Copied!",
                          description: "Encryption key copied to clipboard",
                          position: "center",
                        })
                    }
                  >
                    <FaCopy />
                  </Button>
                </div>
              </CardContent>

              <CardContent className="fade-in visible space-y-2">
                <Label htmlFor="encryptedText" className="text-sm">
                  Encrypted Text
                </Label>
                <div className="flex items-center space-x-2">
                  <Textarea
                    id="encryptedText"
                    className="w-full"
                    value={encryptedText}
                    readOnly
                  />
                  <Button
                    style={{ zIndex: 10 }}
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      copyToClipboard("encryptedText", {
                        title: "Copied!",
                        description: "Encrypted text copied to clipboard",
                        position: "center",
                      })
                    }
                  >
                    <FaCopy />
                  </Button>
                </div>
              </CardContent>
            </div>
          )}

          <CardFooter className="flex flex-col space-y-2">
            <Button
              className="w-full"
              onClick={() => handleSubmit()}
              disabled={isDisabled}
            >
              Encrypt
            </Button>

            {submit && (
              <Button className="w-full" onClick={() => resetForm()}>
                Reset
              </Button>
            )}
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="decrypt">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Decrypt</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Paste the encrypted text and the corresponding key below to
              decrypt and reveal the original content securely and efficiently.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="toDecrypt" className="text-sm">
                Enter encrypted text
              </Label>
              <Textarea
                id="toDecrypt"
                className="w-full"
                value={toDecrypt}
                onChange={handleEncryptedTextChange}
              ></Textarea>
            </div>
            <div className="space-y-1">
              <Label htmlFor="key" className="text-sm">
                Enter encryption key
              </Label>
              <Input
                id="key"
                className="w-full"
                value={decryptionKey}
                onChange={handleDecryptionKeyChange}
              />
            </div>

            {submitDecrypt && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="decryptedText" className="text-sm">
                  Decrypted Text
                </Label>
                <Textarea
                  id="decryptedText"
                  className="w-full"
                  value={decryptedText}
                  readOnly
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <Button
              className="w-full"
              onClick={() => handleDecrypt()}
              disabled={disabledDecrypt}
            >
              Decrypt
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );

}
