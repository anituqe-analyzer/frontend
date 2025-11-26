import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AuthModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Zaloguj się</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Konto użytkownika</DialogTitle>
          <DialogDescription>
            Zaloguj się lub utwórz nowe konto, aby weryfikować przedmioty.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Logowanie</TabsTrigger>
            <TabsTrigger value="register">Rejestracja</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Hasło</Label>
                <Input id="password" type="password" />
              </div>
              <Button className="w-full">Zaloguj się</Button>
            </div>
          </TabsContent>
          <TabsContent value="register">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="m@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reg-password">Hasło</Label>
                <Input id="reg-password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Potwierdź hasło</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button className="w-full">Utwórz konto</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
