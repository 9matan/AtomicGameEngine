
#include <Atomic/Atomic.h>
#include <Atomic/Core/ProcessUtils.h>
#include <Atomic/Resource/ResourceCache.h>

#include "JSBind.h"
#include "JSBindings.h"

#ifdef WIN32
#include <Windows.h>
#endif

using namespace Atomic;

SharedPtr<Context> JSBind::context_;
SharedPtr<FileSystem> JSBind::fileSystem_;
SharedPtr<Engine> JSBind::engine_;
String JSBind::ROOT_FOLDER;

void JSBind::Initialize()
{
    context_ = new Context();
    fileSystem_ = new FileSystem(context_);
    engine_ = new Engine(context_);

}

#include <stdio.h>

void Run(const Vector<String>& arguments)
{
    JSBind::Initialize();

    if (arguments.Size() < 1)
    {
        ErrorExit("Usage: JSBind absolute_path_to_atomic_runtime_source_tree");
    }

    JSBind::ROOT_FOLDER = arguments[0];

    if (!JSBind::fileSystem_->DirExists(JSBind::ROOT_FOLDER + "/Source/Tools/JSBind"))
    {
        ErrorExit("The given Atomic Runtime source tree is invalid");
    }

    VariantMap engineParameters;
    engineParameters["Headless"] = true;
    engineParameters["WorkerThreads"] = false;
    engineParameters["LogName"] = String::EMPTY;

    JSBind::engine_->Initialize(engineParameters);

    ResourceCache* cache = JSBind::context_->GetSubsystem<ResourceCache>();
    cache->AddResourceDir(JSBind::ROOT_FOLDER + "/Source/Tools/JSBind");

    JSBindings* bindings = new JSBindings();
    bindings->Initialize();
    bindings->ParseHeaders();
}

int main(int argc, char** argv)
{
    Vector<String> arguments;

    arguments = ParseArguments(argc, argv);

    Run(arguments);
    return 0;
}

